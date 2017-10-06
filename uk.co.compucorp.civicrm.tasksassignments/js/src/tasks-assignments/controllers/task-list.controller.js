/* eslint-env amd */

define([
  'common/angular',
  'common/lodash',
  'common/moment',
  'tasks-assignments/controllers/controllers',
  'tasks-assignments/services/contact',
  'tasks-assignments/services/dialog',
  'tasks-assignments/services/task',
  'tasks-assignments/services/assignment'
], function (angular, _, moment, controllers) {
  'use strict';

  controllers.controller('TaskListController', TaskListController);

  TaskListController.$inject = ['$scope', '$uibModal', '$dialog', '$rootElement',
    '$rootScope', '$filter', '$timeout', '$state', '$log', 'taskList', 'config',
    'ContactService', 'AssignmentService', 'TaskService', 'settings', 'HR_settings'
  ];

  function TaskListController ($scope, $modal, $dialog, $rootElement, $rootScope, $filter, $timeout, $state, $log, taskList,
    config, ContactService, AssignmentService, TaskService, settings, HRSettings) {
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
    vm.dueFilters = [
      { badgeClass: 'danger', calendarView: 'month', value: 'overdue' },
      { badgeClass: 'primary', calendarView: 'day', value: 'dueToday' },
      { badgeClass: 'primary', calendarView: 'week', value: 'dueThisWeek' }
    ];
    vm.dpOpened = {
      filterDates: {}
    };
    vm.isCollapsed = {
      filterAdvanced: true,
      filterDates: true,
      taskListResolved: true
    };
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
    vm.watchDateFilters = watchDateFilters;

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

      AssignmentService.updateCache(obj);
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

      ContactService.updateCache(obj);

      return true;
    }

    function changeStatus (task, statusId) {
      $scope.$broadcast('ct-spinner-show', 'task' + task.id);

      TaskService.save({
        id: task.id,
        status_id: statusId || '2'
      }).then(function (results) {
        $rootScope.$broadcast('taskFormSuccess', results, task);
        $scope.$broadcast('ct-spinner-hide', 'task' + task.id);
        AssignmentService.updateTab();
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
    };

    function updateTask (task, updateObj) {
      vm.cacheContact(task.assignee_contact_id[0]);

      return TaskService
        .save(angular.extend({}, task, updateObj))
        .catch(function (reason) {
          CRM.alert(reason, 'Error', 'error');
        });
    }

    function updateContacts (contacts) {
      vm.contacts = contacts;
    }

    function refreshContacts (input) {
      if (!input) {
        return;
      }

      ContactService.search(input, {
        contact_type: 'Individual'
      }).then(function (results) {
        vm.contacts = results;
      });
    }

    function refreshAssignments (input, targetContactId, caseId) {
      if (!input || !targetContactId || !caseId) {
        return;
      }

      AssignmentService.search(input, caseId).then(function (results) {
        vm.assignments = $filter('filter')(results, function (val) {
          return +val.extra.contact_id === +targetContactId;
        });
      });
    }

    function loadTasksResolved () {
      if (vm.listResolvedLoaded) {
        return;
      }

      // Remove resolved tasks from the task list
      $filter('filterByStatus')(vm.list, $rootScope.cache.taskStatusResolve, false);

      TaskService.get({
        'target_contact_id': config.CONTACT_ID,
        'status_id': {
          'IN': config.status.resolve.TASK
        }
      }).then(function (taskListResolved) {
        var contactIds = vm.contactIds;
        var assignmentIds = vm.assignmentIds;

        vm.collectId(taskListResolved);

        if (contactIds && contactIds.length) {
          ContactService.get({'IN': contactIds}).then(function (data) {
            ContactService.updateCache(data);
          });
        }

        if (assignmentIds && assignmentIds.length && settings.extEnabled.assignments) {
          AssignmentService.get({'IN': assignmentIds}).then(function (data) {
            AssignmentService.updateCache(data);
          });
        }

        Array.prototype.push.apply(vm.list, taskListResolved);

        vm.listResolvedLoaded = true;
      });
    }

    function deleteTask (task) {
      $dialog.open({
        msg: 'Are you sure you want to delete this task?'
      }).then(function (confirm) {
        if (!confirm) {
          return;
        }

        TaskService.delete(task.id).then(function (results) {
          vm.list.splice(vm.list.indexOf(task), 1);

          $rootScope.$broadcast('taskDelete', task.id);
          AssignmentService.updateTab();
        });
      });
    }

    function viewInCalendar (view) {
      $state.go('calendar.mwl.' + view);
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

    (function init () {
      var contactIds = vm.contactIds;
      var assignmentIds = vm.assignmentIds;

      vm.collectId(taskList);
      if (contactIds && contactIds.length) {
        ContactService.get({'IN': contactIds}).then(function (data) {
          ContactService.updateCache(data);
        });
      }

      if (assignmentIds && assignmentIds.length && settings.extEnabled.assignments) {
        AssignmentService.get({'IN': assignmentIds}).then(function (data) {
          AssignmentService.updateCache(data);
        });
      }

      watchDateFilters();

      $rootScope.$broadcast('ct-spinner-hide');
      $log.info($rootScope.cache);
    })();

    $scope.$on('assignmentFormSuccess', function (e, output) {
      Array.prototype.push.apply(vm.list, output.taskList);
    });

    $scope.$on('taskFormSuccess', function (e, output, input) {
      angular.equals({}, input) ? vm.list.push(output) : angular.extend(input, output);
    });

    $scope.$on('crmFormSuccess', function (e, data) {
      if (data.status === 'success') {
        var pattern = /case|activity|assignment/i;

        if (pattern.test(data.title) || matchMessageTitle(pattern, data) || (pattern.test(data.crmMessages[0].text))) {
          $rootScope.cache.assignment = {
            obj: {},
            arr: []
          };
          $state.go($state.current, {}, {reload: true});
        }
      }
    });

    /**
     * Whenever the date filters will change, their corrispondent
     * datepickers will have the minDate or maxDate setting updated
     * accordingly
     */
    function watchDateFilters () {
      $scope.$watch('filterParamsHolder.dateRange.from', function (newValue) {
        vm.datepickerOptions.until.minDate = newValue;
      });

      $scope.$watch('filterParamsHolder.dateRange.until', function (newValue) {
        vm.datepickerOptions.from.maxDate = newValue;
      });
    }
  }
});
