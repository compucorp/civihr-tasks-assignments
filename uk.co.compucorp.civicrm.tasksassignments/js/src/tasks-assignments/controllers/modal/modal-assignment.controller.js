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
    var canCacheRelationshipRequests = true;
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
    vm.relationshipMissingWarnings = {};
    vm.showCId = !config.CONTACT_ID;
    vm.taskList = [];
    vm.workflowActivityTypes = getWorkflowActivityTypes();
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
    vm.createRelationshipForTargetContact = createRelationshipForTargetContact;
    vm.dpOpen = dpOpen;
    vm.hasRelationshipWarnings = hasRelationshipWarnings;
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
          doc.assignee_id = _.first(doc.assignee_contact_id);
          doc.case_id = resultAssignment.id;

          return doc;
        });

        var taskListAssignment = vm.taskList.filter(function (task) {
          return task.create;
        }).map(function (task) {
          task.assignee_id = _.first(task.assignee_contact_id);
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

    /**
     * Opens the contact's relationship creation modal. When a relationship is
     * successfully created it reloads the default assignees for each activity.
     */
    function createRelationshipForTargetContact () {
      var formUrl = CRM.url('civicrm/contact/view/rel', {
        action: 'add',
        cid: vm.assignment.client_id
      });

      CRM.loadForm(formUrl)
        .on('crmFormSuccess', function () {
          // $evalAsync will execute the code in the next digest.
          // this is done because CRM.loadForm works outside of Angular:
          vm.$evalAsync(function () {
            canCacheRelationshipRequests = false;

            initDefaultAssigneesForActivities()
              .then(loadAndCacheContactForActivities);
          });
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
     * Returns object pairings of all the activities and their parent activity type.
     *
     * @return {Array} Each element contains an object that holds an activity and
     *   a type field.
     */
    function getActivitiesAndTypes () {
      var allActivities = _.chain(vm.documentList).concat(vm.taskList).value();
      var activityAndTypes = vm.activity.activitySet.activityTypes.map(function (activityType) {
        var activity = _.find(allActivities, { name: activityType.name });

        if (activity) {
          return {
            activity: activity,
            type: activityType
          };
        }
      });

      return _.compact(activityAndTypes);
    }

    /**
     * Returns all activites that are missing a default assignee related to the
     * target contact.
     *
     * @param  {Array} activitiesAndTypes - An array of activities and their types.
     * @return {Array} the filtered `activitiesAndTypes`.
     */
    function getActivitiesWithoutDefaultRelationship (activitiesAndTypes) {
      return activitiesAndTypes.filter(function (activityAndType) {
        var isDefaultAssigneeByRelationship = activityAndType.type.default_assignee_type === defaultAssigneeOptionsIndex.BY_RELATIONSHIP;
        var hasNoAssignee = _.isEmpty(activityAndType.activity.assignee_contact_id);

        return isDefaultAssigneeByRelationship && hasNoAssignee;
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
      }, null, null, canCacheRelationshipRequests).then(function (result) {
        canCacheRelationshipRequests = true;

        return result.list.map(function (relationship) {
          return relationship.contact_id_b;
        });
      });
    }

    /**
     * returns a filtered list of activity types that belong to the Workflow category.
     *
     * @return {Array}
     */
    function getWorkflowActivityTypes () {
      var CATEGORY_FIELD = 'custom_' + config.customFieldIds['caseType.category'];
      var WORKFLOW_TYPE = 'Workflow';

      return $rootScope.cache.assignmentType.arr.filter(function (assignment) {
        return assignment[CATEGORY_FIELD] === WORKFLOW_TYPE;
      });
    }

    /**
     * Returns true when there are relationship warnigns to be displayed.
     *
     * @return {Boolean}
     */
    function hasRelationshipWarnings () {
      return _.values(vm.relationshipMissingWarnings).length > 0;
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
     * It also populates the relationshop warnings object in case one or more relationships
     * are missing for the target contact.
     *
     * @return {Promise}
     */
    function initDefaultAssigneesForActivities () {
      // skip if an activity set and types have not been defined:
      if (!vm.activity.activitySet.activityTypes) {
        return $q.resolve();
      }

      vm.relationshipMissingWarnings = {};

      return $q.resolve(getActivitiesAndTypes())
        .then(setDefaultAssignees)
        .then(setRelationshipMissingWarnings);
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
            return { id: contact.contact_id, label: contact.display_name };
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
     * Finds the default assignee for the given activity type and assigns them
     * to their corresponding activity.
     *
     * @param  {Array}   activitiesAndTypes - An array of activities and their types.
     * @return {Promise} After configuring the default assignees it resolves to
     *  the provided `activitiesAndTypes` parameter for chaining purposes.
     */
    function setDefaultAssignees (activitiesAndTypes) {
      var promises = activitiesAndTypes.map(function (activityAndType) {
        return getDefaultAssigneeForActivityType(activityAndType.type)
          .then(function (assigneeId) {
            activityAndType.activity.assignee_contact_id = assigneeId;

            return activityAndType;
          });
      });

      return $q.all(promises);
    }

    /**
     * Populates the `relationshipMissingWarnings` object based on activites
     * that are missing a default assignee where the default assignee is related
     * to the target contact.
     *
     * @param {Array} activitiesAndTypes - An array of activities and their types.
     */
    function setRelationshipMissingWarnings (activitiesAndTypes) {
      var activitiesWithMissingRelationships;

      // skip if no contact has been selected:
      if (!vm.assignment.client_id) {
        return;
      }

      activitiesWithMissingRelationships = getActivitiesWithoutDefaultRelationship(activitiesAndTypes);
      vm.relationshipMissingWarnings = _.chain(activitiesWithMissingRelationships)
        .indexBy('activity.activity_type_id').mapValues('type.default_assignee_relationship').value();
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
