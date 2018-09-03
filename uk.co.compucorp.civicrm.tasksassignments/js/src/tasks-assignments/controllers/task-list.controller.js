/* eslint-env amd */

define([
  'common/angular',
  'common/lodash',
  'common/moment'
], function (angular, _, moment) {
  'use strict';

  TaskListController.$inject = [
    '$filter', '$log', '$rootElement', '$rootScope', '$scope', '$timeout',
    '$dialog', '$state', '$uibModal', 'assignmentService', 'contactService',
    'taskService', 'HR_settings', 'config', 'settings', 'taskList'
  ];

  function TaskListController ($filter, $log, $rootElement, $rootScope, $scope,
    $timeout, $dialog, $state, $modal, assignmentService, contactService,
    taskService, HRSettings, config, settings, taskList) {
    $log.debug('Controller: TaskListController');

    var vm = this;

    vm.assignmentIds = [];
    vm.assignments = [];
    vm.contactIds = [];
    vm.contacts = [];
    vm.dueThisWeek = 0;
    vm.dueToday = 0;
    vm.format = HRSettings.DATE_FORMAT;
    vm.list = taskList;
    vm.listFiltered = [];
    vm.listLimit = 5;
    vm.listOngoing = [];
    vm.listResolved = [];
    vm.listResolvedLoaded = false;
    vm.overdue = 0;
    vm.dpOpened = {
      filterDates: {}
    };
    vm.dueFilters = [
      { badgeClass: 'danger', calendarView: 'month', value: 'overdue' },
      { badgeClass: 'primary', calendarView: 'day', value: 'dueToday' },
      { badgeClass: 'primary', calendarView: 'week', value: 'dueThisWeek' }
    ];
    vm.filterParams = {
      contactId: null,
      ownership: $state.params.ownership || null,
      dateRange: {
        from: null,
        until: null
      },
      due: null,
      assignmentType: []
    };
    vm.filterParamsHolder = {
      dateRange: {
        from: moment().startOf('day').toDate(),
        until: moment().add(1, 'month').startOf('day').toDate()
      }
    };
    vm.datepickerOptions = {
      from: { maxDate: vm.filterParamsHolder.dateRange.until },
      until: { minDate: vm.filterParamsHolder.dateRange.from }
    };
    vm.isCollapsed = {
      filterAdvanced: true,
      filterDates: true,
      taskListResolved: true
    };
    vm.label = {
      overdue: 'Overdue',
      dueToday: 'Due Today',
      dueThisWeek: 'Due This Week',
      dateRange: 'Due Tasks'
    };

    vm.applySidebarFilters = applySidebarFilters;
    vm.cacheAssignment = cacheAssignment;
    vm.cacheContact = cacheContact;
    vm.changeStatus = changeStatus;
    vm.collectId = collectId;
    vm.deleteTask = deleteTask;
    vm.filterByDateField = filterByDateField;
    vm.loadTasksResolved = loadTasksResolved;
    vm.refreshAssignments = refreshAssignments;
    vm.refreshContacts = refreshContacts;
    vm.updateContacts = updateContacts;
    vm.updateTask = updateTask;
    vm.viewInCalendar = viewInCalendar;

    (function init () {
      var contactIds = vm.contactIds;
      var assignmentIds = vm.assignmentIds;

      vm.collectId(taskList);
      if (contactIds && contactIds.length) {
        contactService.get({'IN': contactIds}).then(function (data) {
          contactService.updateCache(data);
        });
      }

      if (assignmentIds && assignmentIds.length && settings.extEnabled.assignments) {
        assignmentService.get({'IN': assignmentIds}).then(function (data) {
          assignmentService.updateCache(data);
        });
      }

      initListeners();
      initWatchers();

      $rootScope.$broadcast('ct-spinner-hide');
      $log.info($rootScope.cache);
    }());

    /**
     * Applies the filters on the sidebar
     */
    function applySidebarFilters () {
      vm.filterParams.dateRange.from = vm.filterParamsHolder.dateRange.from;
      vm.filterParams.dateRange.until = vm.filterParamsHolder.dateRange.until;
      vm.filterParams.due = 'dateRange';
    }

    /**
     * Caches assignments and saves for future use
     * @param  {object} $item
     */
    function cacheAssignment ($item) {
      if ($rootScope.cache.assignment.obj[$item.id]) {
        return;
      }

      var obj = {};

      obj[$item.id] = {
        case_type_id: $filter('filter')($rootScope.cache.assignmentType.arr, { title: $item.extra.case_type })[0].id,
        client_id: {
          '1': $item.extra.contact_id
        },
        contact_id: {
          '1': $item.extra.contact_id
        },
        contacts: [
          {
            sort_name: $item.extra.sort_name,
            contact_id: $item.extra.contact_id
          }
        ],
        end_date: $item.extra.end_date,
        id: $item.id,
        is_deleted: $item.label_class === 'strikethrough' ? '1' : '0',
        start_date: $item.extra.start_date,
        subject: $item.extra.case_subject
      };

      assignmentService.updateCache(obj);
    }

    /**
     * Updates the permanent contact cache held in $rootScope, with the contact
     * with the given id
     *
     * The full data of the contact is found in the temporary contact
     * cache held in $scope.contacts
     *
     * @param {int} contactId
     * @return {boolean}
     */
    function cacheContact (contactId) {
      var obj = {};
      var contact = vm.contacts.filter(function (contact) {
        return contact.id === contactId;
      })[0];

      if (!contact) {
        return;
      }

      obj[contact.id] = {
        contact_id: contact.id,
        contact_type: contact.icon_class,
        sort_name: contact.label,
        display_name: contact.label,
        email: contact.description.length ? contact.description[0] : ''
      };

      contactService.updateCache(obj);

      return true;
    }

    function changeStatus (task, statusId) {
      $scope.$broadcast('ct-spinner-show', 'task' + task.id);

      taskService.save({
        id: task.id,
        status_id: statusId || '2'
      }).then(function (results) {
        $rootScope.$broadcast('taskFormSuccess', results, task);
        $scope.$broadcast('ct-spinner-hide', 'task' + task.id);
        assignmentService.updateTab();
      });
    }

    /**
     * Collects contact and assignment Ids for the given task
     *
     * @param  {object} taskList
     */
    function collectId (taskList) {
      var contactIds = vm.contactIds;
      var assignmentIds = vm.assignmentIds;

      contactIds.push(config.LOGGED_IN_CONTACT_ID);

      if (config.CONTACT_ID) {
        contactIds.push(config.CONTACT_ID);
      }

      function collectCId (task) {
        contactIds.push(task.source_contact_id);

        if (task.assignee_contact_id && task.assignee_contact_id.length) {
          contactIds.push(task.assignee_contact_id[0]);
        }

        if (task.target_contact_id && task.target_contact_id.length) {
          contactIds.push(task.target_contact_id[0]);
        }
      }

      function collectAId (task) {
        if (task.case_id) {
          assignmentIds.push(task.case_id);
        }
      }

      angular.forEach(taskList, function (task) {
        collectCId(task);
        collectAId(task);
      });
    }

    function deleteTask (task) {
      $dialog.open({
        msg: 'Are you sure you want to delete this task?'
      }).then(function (confirm) {
        if (!confirm) {
          return;
        }

        taskService.delete(task.id).then(function (results) {
          vm.list.splice(vm.list.indexOf(task), 1);

          $rootScope.$broadcast('taskDelete', task.id);
          assignmentService.updateTab();
        });
      });
    }

    /**
     * Filters the tasks list based on filter type and due or expiry date
     *
     * @param {string} type filter type
     * @return {array} task list
     */
    function filterByDateField (type) {
      return $filter('filterByDateField')(vm.list, type, 'activity_date_time', vm.filterParams.dateRange);
    }

    function initListeners () {
      $scope.$on('assignmentFormSuccess', function (e, output) {
        Array.prototype.push.apply(vm.list, output.taskList);
      });

      $scope.$on('taskFormSuccess', function (e, output, input) {
        angular.equals({}, input) ? vm.list.push(output) : angular.extend(input, output);
      });

      $scope.$on('crmFormSuccess', function (e, data) {
        if (data.status === 'success') {
          var pattern = /case|activity|assignment/i;

          if ((pattern.test(data.title) ||
            matchMessageTitle(pattern, data) ||
            (pattern.test(data.crmMessages[0].text))) &&
            (!'activity_type'.test(data.userContext)) // Adding activity type does not require page reload as it auto update cache
          ) {
            $rootScope.cache.assignment = {
              obj: {},
              arr: []
            };
            $state.go($state.current, {}, {reload: true});
          }
        }
      });
    }

    /**
     * Whenever the date filters will change, their corrispondent
     * datepickers will have the minDate or maxDate setting updated
     * accordingly
     */
    function initWatchers () {
      $scope.$watch('filterParamsHolder.dateRange.from', function (newValue) {
        vm.datepickerOptions.until.minDate = newValue;
      });

      $scope.$watch('filterParamsHolder.dateRange.until', function (newValue) {
        vm.datepickerOptions.from.maxDate = newValue;
      });
    }

    function loadTasksResolved () {
      if (vm.listResolvedLoaded) {
        return;
      }

      // Remove resolved tasks from the task list
      $filter('filterByStatus')(vm.list, $rootScope.cache.taskStatusResolve, false);

      taskService.get({
        'target_contact_id': config.CONTACT_ID,
        'status_id': {
          'IN': config.status.resolve.TASK
        }
      }).then(function (taskListResolved) {
        var contactIds = vm.contactIds;
        var assignmentIds = vm.assignmentIds;

        vm.collectId(taskListResolved);

        if (contactIds && contactIds.length) {
          contactService.get({'IN': contactIds}).then(function (data) {
            contactService.updateCache(data);
          });
        }

        if (assignmentIds && assignmentIds.length && settings.extEnabled.assignments) {
          assignmentService.get({'IN': assignmentIds}).then(function (data) {
            assignmentService.updateCache(data);
          });
        }

        Array.prototype.push.apply(vm.list, taskListResolved);

        vm.listResolvedLoaded = true;
      });
    }

    /**
     * Check the CRM message title to match the given pattern
     *
     * @param  {string} pattern
     * @param  {object} data
     * @return {boolean}
     */
    function matchMessageTitle (pattern, data) {
      return (data.crmMessages && data.crmMessages.length) && pattern.test(data.crmMessages[0].title);
    }

    function refreshAssignments (input, targetContactId, caseId) {
      if (!input || !targetContactId || !caseId) {
        return;
      }

      assignmentService.search(input, caseId).then(function (results) {
        vm.assignments = $filter('filter')(results, function (val) {
          return +val.extra.contact_id === +targetContactId;
        });
      });
    }

    function refreshContacts (input) {
      if (!input) {
        return;
      }

      contactService.search(input, {
        contact_type: 'Individual'
      }).then(function (results) {
        vm.contacts = results;
      });
    }

    function updateContacts (contacts) {
      vm.contacts = contacts;
    }

    function updateTask (task, updateObj) {
      vm.cacheContact(task.assignee_contact_id[0]);

      return taskService
        .save(angular.extend({}, task, updateObj))
        .catch(function (reason) {
          CRM.alert(reason, 'Error', 'error');
        });
    }

    function viewInCalendar (view) {
      $state.go('calendar.mwl.' + view);
    }
  }

  return { TaskListController: TaskListController };
});
