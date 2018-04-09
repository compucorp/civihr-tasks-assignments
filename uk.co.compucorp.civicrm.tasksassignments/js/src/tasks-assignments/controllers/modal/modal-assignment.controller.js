/* eslint-env amd */

define([
  'common/lodash',
  'common/angular',
  'common/moment'
], function (_, angular, moment) {
  'use strict';

  ModalAssignmentController.__name = 'ModalAssignmentController';
  ModalAssignmentController.$inject = [
    '$filter', '$log', '$q', '$rootScope', '$scope', '$timeout', '$uibModalInstance',
    'HR_settings', 'config', 'settings', 'assignmentService', 'taskService',
    'documentService', 'contactService', 'data', 'defaultAssigneeOptions', 'session',
    'RelationshipModel'
  ];

  function ModalAssignmentController ($filter, $log, $q, $rootScope, vm,
    $timeout, $modalInstance, hrSettings, config, settings, assignmentService,
    taskService, documentService, contactService, data, defaultAssigneeOptions,
    session, Relationship) {
    $log.debug('Controller: ModalAssignmentController');

    var defaultAssigneeOptionsIndex;
    var activityModel = {
      activity_type_id: null,
      assignee_contact_id: [],
      case_id: null,
      create: true,
      isAdded: false,
      name: null,
      source_contact_id: config.LOGGED_IN_CONTACT_ID,
      status_id: '1',
      offset: 0
    };

    vm.assignment = angular.copy(data);
    vm.assignment.status_id = '1';
    vm.assignment.contact_id = config.CONTACT_ID;
    vm.assignment.client_id = vm.assignment.contact_id;
    vm.assignment.subject = '';
    vm.assignment.dueDate = null;
    vm.copyMessage = 'Click here to copy the value in row one to all rows.';
    vm.documentList = [];
    vm.dpOpened = {};
    vm.format = hrSettings.DATE_FORMAT.toLowerCase();
    vm.showCId = !config.CONTACT_ID;
    vm.taskList = [];
    vm.activity = {
      activitySet: {}
    };
    vm.alert = {
      show: false,
      msg: '',
      type: 'danger'
    };
    // The contacts collections used by the lookup directives divided by type
    vm.contacts = {
      target: [],
      document: [],
      task: []
    };

    vm.addActivity = addActivity;
    vm.cacheContact = cacheContact;
    vm.cancel = cancel;
    vm.confirm = confirm;
    vm.copyAssignee = copyAssignee;
    vm.copyDate = copyDate;
    vm.dpOpen = dpOpen;
    vm.onTargetContactChange = onTargetContactChange;
    vm.refreshContacts = refreshContacts;
    vm.removeActivity = removeActivity;
    vm.setData = setData;
    vm.updateTimeline = updateTimeline;

    (function init () {
      initDefaultAssigneeOptionsIndex();
      initWatchers();
    }());

    function addActivity (activityArr) {
      if (!activityArr) {
        return;
      }

      activityArr.push(angular.extend(angular.copy(activityModel), { isAdded: true }));
    }

    function cacheContact ($item) {
      var obj = {};

      obj[$item.id] = {
        contact_id: $item.id,
        contact_type: $item.icon_class,
        sort_name: $item.label,
        display_name: $item.label,
        email: $item.description.length ? $item.description[0] : ''
      };

      contactService.updateCache(obj);
    }

    function cancel () {
      $modalInstance.dismiss('cancel');
    }

    function confirm () {
      if (
        !($filter('filter')(vm.taskList, { create: true })).length &&
        !($filter('filter')(vm.documentList, { create: true })).length
      ) {
        vm.alert.msg = 'Please add at least one task.';
        vm.alert.show = true;
        return;
      }

      if (!validateRequiredFields(vm.assignment)) {
        return;
      }

      vm.$broadcast('ct-spinner-show');
      vm.assignment.start_date = new Date();

      assignmentService.save(vm.assignment).then(function (resultAssignment) {
        var documentListAssignment = vm.documentList.filter(function (doc) {
          return doc.create;
        }).map(function (doc) {
          doc.case_id = resultAssignment.id;
          return doc;
        });

        var taskListAssignment = vm.taskList.filter(function (task) {
          return task.create;
        }).map(function (task) {
          task.case_id = resultAssignment.id;
          return task;
        });

        $q.all({
          relationship: assignmentService.assignCoordinator(vm.assignment.contact_id, resultAssignment.id),
          document: documentService.saveMultiple(documentListAssignment.map(function (doc) {
            return angular.copy(doc);
          })),
          task: taskService.saveMultiple(taskListAssignment.map(function (task) {
            return angular.copy(task);
          }))
        }).then(function (results) {
          var i;
          var taskArr = [];
          var documentArr = [];
          var cacheAssignmentObj = {};

          for (i = 0; i < results.task.length; i++) {
            taskListAssignment[i].id = results.task[i].id;
            taskArr.push(results.task[i].id);
          }

          for (i = 0; i < results.document.length; i++) {
            documentListAssignment[i].id = results.document[i].id;
            documentArr.push(results.document[i].id);
          }

          cacheAssignmentObj[resultAssignment.id] = angular.extend(angular.copy(vm.assignment), {
            id: resultAssignment.id,
            client_id: {
              '1': vm.assignment.client_id
            },
            contact_id: {
              '1': vm.assignment.contact_id
            },
            contacts: [
              {
                sort_name: $rootScope.cache.contact.obj[vm.assignment.contact_id].sort_name,
                contact_id: vm.assignment.contact_id,
                role: 'Client'
              },
              {
                sort_name: $rootScope.cache.contact.obj[config.LOGGED_IN_CONTACT_ID].sort_name,
                contact_id: config.LOGGED_IN_CONTACT_ID,
                role: 'Case Coordinator'
              }
            ],
            is_deleted: '0',
            end_date: '',
            activities: taskArr.concat(documentArr)
          });

          assignmentService.updateCache(cacheAssignmentObj);
          assignmentService.updateTab(1);

          $modalInstance.close({
            documentList: documentListAssignment,
            taskList: taskListAssignment
          });

          vm.$broadcast('ct-spinner-hide');
        }, function (reason) {
          CRM.alert(reason, 'Error', 'error');
          vm.$broadcast('ct-spinner-hide');
          return $q.reject();
        });
      }, function (reason) {
        CRM.alert(reason, 'Error', 'error');
        vm.$broadcast('ct-spinner-hide');
        return $q.reject();
      });
    }

    /**
     * Copy assignee id and contacts collection from the first
     * enabled item of the list to the rest of the items
     *
     * @param {Array} list
     * @param {string} type (document, task)
     */
    function copyAssignee (list, type) {
      var firstEnabled = firstEnabledItem(list);

      list.forEach(function (item, index) {
        var firstEnabledContacts = vm.contacts[type][_.indexOf(list, firstEnabled)] || [];
        var firstEnabledAssignee = firstEnabled.assignee_contact_id ? [firstEnabled.assignee_contact_id[0]] : firstEnabled.assignee_contact_id;

        if (item.create) {
          vm.contacts[type][index] = firstEnabledContacts.slice();
          item.assignee_contact_id = firstEnabledAssignee;
        }
      });
    }

    /**
     * Copy date from the first enabled item of the list
     * to the rest of the items
     *
     * @param {Array} list
     */
    function copyDate (list) {
      list.forEach(function (item) {
        if (item.create) {
          item.activity_date_time = firstEnabledItem(list).activity_date_time;
        }
      });
    }

    function dpOpen ($event, key) {
      $event.preventDefault();
      $event.stopPropagation();

      vm.dpOpened[key] = true;
    }

    /**
     * Returns the first enable item in the given collection
     *
     * @param  {Array} collection
     * @return {Object}
     */
    function firstEnabledItem (collection) {
      return _.find(collection, function (item) {
        return item.create;
      });
    }

    /**
     * Returns the default assignee for the activity type provided.
     *
     * @param {Object} activityType the activity type definition.
     * @return {Promise} resolves to an array wrapping the default assignee's contact id or NULL in case of none.
     */
    function getDefaultAssigneeForActivityType (activityType) {
      switch (activityType.default_assignee_type) {
        case defaultAssigneeOptionsIndex.SPECIFIC_CONTACT:
          return $q.resolve([ activityType.default_assignee_contact ]);
        case defaultAssigneeOptionsIndex.USER_CREATING_THE_CASE:
          return $q.resolve([ session.contactId ]);
        case defaultAssigneeOptionsIndex.BY_RELATIONSHIP:
          return getDefaultAssigneeForActivityTypeByRelationship(activityType);
        case defaultAssigneeOptionsIndex.NONE:
        default:
          return $q.resolve(null);
      }
    }

    /**
     * Returns the default assignee depending on the relationship to the selected
     * target contact.
     *
     * @param {Object} activityType the activity type definition.
     * @return {Promise}
     */
    function getDefaultAssigneeForActivityTypeByRelationship (activityType) {
      // skip if a target contact has not been selected:
      if (!vm.assignment.client_id) {
        return $q.resolve(null);
      }

      return Relationship.allValid({
        'contact_id_a': vm.assignment.client_id,
        'relationship_type_id.name_b_a': activityType.default_assignee_relationship,
        'options': { 'limit': 1 }
      }).then(function (result) {
        return result.list.map(function (relationship) {
          return relationship.contact_id_b;
        });
      });
    }

    /**
     * Initializes the watcher for activity set. When a new timeline is selected,
     * the activities are split into tasks and documents. Finally, the default
     * assignee for each activity is populated.
     */
    function initActivitySetWatcher () {
      var documentsTabIsVisible = !!settings.tabEnabled.documents;
      var documentTypesIndexedByName = _.indexBy($rootScope.cache.documentType.arr, 'value');
      var taskTypesIndexedByName = _.indexBy($rootScope.cache.taskType.arr, 'value');

      vm.$watch('activity.activitySet', function (activitySet) {
        if (!activitySet || !activitySet.activityTypes) {
          vm.taskList = [];
          return;
        }

        vm.documentList = [];
        vm.taskList = [];

        activitySet.activityTypes.forEach(function (activityType) {
          var activity = angular.copy(activityModel);
          var documentType = documentTypesIndexedByName[activityType.name];
          var taskType = taskTypesIndexedByName[activityType.name];

          activity.name = activityType.name;
          activity.offset = activityType.reference_offset;

          if (documentType && documentsTabIsVisible) {
            activity.activity_type_id = documentType.key;
            vm.documentList.push(activity);
          } else if (!documentType) {
            // anything other than a document is added tot he task list:
            activity.activity_type_id = taskType ? taskType.key : null;
            vm.taskList.push(activity);
          }
        });

        initDefaultAssigneesForActivities()
          .then(loadAndCacheContactForActivities);
      });
    }

    /**
     * Initializes the assignment types watcher. This is done in order to wait
     * for the root cache to load the assignment types and store the activity
     * sets (timelines).
     */
    function initAssignmentTypesWatcher () {
      var assignmentTypesListener = $rootScope.$watch('cache.assignmentType.obj', function (cache) {
        if (!_.isEmpty(cache)) {
          setData();
          assignmentTypesListener();
        }
      }, true);
    }

    /**
     * Initializes the default assignee for each one of the tasks and documents available.
     *
     * @return {Promise}
     */
    function initDefaultAssigneesForActivities () {
      var promises;

      // skip if an activity set and types have not been defined:
      if (!vm.activity.activitySet.activityTypes) {
        return;
      }

      promises = vm.activity.activitySet.activityTypes.map(function (activityType) {
        var activity = _.chain(vm.documentList).concat(vm.taskList)
          .find({ name: activityType.name }).value();

        if (!activity) {
          return;
        }

        return getDefaultAssigneeForActivityType(activityType)
          .then(function (assigneeId) {
            activity.assignee_contact_id = assigneeId;
          });
      });

      return $q.all(promises);
    }

    /**
     * Initializes the default assignee options index by converting the array
     * of options into an object of name/value pairs.
     */
    function initDefaultAssigneeOptionsIndex () {
      defaultAssigneeOptionsIndex = {};

      _.forEach(defaultAssigneeOptions, function (option) {
        defaultAssigneeOptionsIndex[option.name] = option.value;
      });
    }

    /**
     * Initializes the watchers for activity set and assignment types.
     */
    function initWatchers () {
      initActivitySetWatcher();
      initAssignmentTypesWatcher();
    }

    /**
     * Requests the contact information for each task and document assignees and
     * populates the contact's cache. This can  be useful when selecting assignees
     * automatically since the name of the contact would not be displayed otherwise.
     *
     * @return {Promise}
     */
    function loadAndCacheContactForActivities () {
      var contactIds = _.chain(vm.taskList).concat(vm.documentList).map(function (activity) {
        return activity.assignee_contact_id;
      }).flatten().compact().uniq().value();

      // skip if there are no contacts assigned to activitities
      if (contactIds.length === 0) {
        return;
      }

      return contactService.get({ IN: contactIds })
        .then(function (contacts) {
          var cachedContacts = _.map(contacts, function (contact) {
            return { id: contact.id, label: contact.display_name };
          });

          vm.contacts.task = vm.taskList.map(function () { return cachedContacts; });
          vm.contacts.document = vm.documentList.map(function () { return cachedContacts; });
        });
    }

    /**
     * Event function triggered when the target contact changes. It copies the
     * assignment's contact_id into the client_id property and initializes the
     * tass default assignees based on the selected target contact.
     */
    function onTargetContactChange () {
      vm.assignment.client_id = vm.assignment.contact_id;

      initDefaultAssigneesForActivities()
        .then(loadAndCacheContactForActivities);
    }

    /**
     * Fetches and stores a list of contacts based on the given
     * query string
     *
     * @param {string} input
     *   The search query the user typed
     * @param {string} type
     *   The type of contacts collection that the contacts will be stored
     *   into (target, task, or document)
     * @param {int} index
     *   When fetching contacts for either the task or documents collection
     *   the list will be stored as a sub-collection (at the given index)
     *   so that each task or document has a separate contacts list
     */
    function refreshContacts (input, type, index) {
      if (!input) {
        return;
      }

      contactService.search(input, { contact_type: 'Individual' })
        .then(function (results) {
          if (type === 'target') {
            vm.contacts[type] = results;
          } else {
            vm.contacts[type][index] = results;
          }
        });
    }

    function removeActivity (activityArr, index) {
      if (!activityArr) {
        return;
      }

      activityArr.splice(index, 1);
    }

    function setData () {
      var assignmentType = $rootScope.cache.assignmentType.obj[vm.assignment.case_type_id];

      if (!assignmentType) {
        vm.activity.activitySet = {};
        vm.assignment.subject = '';

        return;
      }

      vm.activity.activitySet = assignmentType.definition.activitySets[0];
      vm.assignment.subject = $rootScope.cache.assignmentType.obj[vm.assignment.case_type_id].title;

      vm.assignment.dueDate = vm.assignment.dueDate || new Date(new Date().setHours(0, 0, 0, 0));
    }

    /**
     * Update activitySet with the current timeline
     *
     * @param  {object} item Timeline item
     */
    function updateTimeline (item) {
      vm.activity.activitySet = item;
    }

    /**
     * Validates if the required fields values are present
     * and shows a notification if needed
     *
     * @param  {Object} assignment The assignment to validate
     * @return {boolean}     Whether the required field values are present
     */
    function validateRequiredFields (assignment) {
      var missingRequiredFields = [];

      !assignment.contact_id && missingRequiredFields.push('Target Contact');
      !assignment.case_type_id && missingRequiredFields.push('Assignment type');
      !assignment.dueDate && missingRequiredFields.push('Key date');

      vm.taskList.filter(function (task) {
        return task.create;
      })
        .forEach(function (task) {
          if (!_.includes(missingRequiredFields, 'Activity type')) {
            !task.activity_type_id && missingRequiredFields.push('Activity type');
          }

          if (!_.includes(missingRequiredFields, 'Activity Due Date')) {
            !task.activity_date_time && missingRequiredFields.push('Activity Due Date');
          }
        });

      if (missingRequiredFields.length) {
        var notification = CRM.alert(missingRequiredFields.join(', '),
          missingRequiredFields.length === 1 ? 'Required field' : 'Required fields', 'error');

        $timeout(function () {
          notification.close();
          notification = null;
        }, 5000);

        return false;
      }

      return true;
    }
  }

  return ModalAssignmentController;
});
