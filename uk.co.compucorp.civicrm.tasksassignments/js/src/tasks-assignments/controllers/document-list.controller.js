/* eslint-env amd */

define([
  'common/angular',
  'common/moment',
  'tasks-assignments/controllers/controllers',
  'tasks-assignments/services/contact',
  'tasks-assignments/services/document',
  'tasks-assignments/services/file',
  'tasks-assignments/services/assignment'
], function (angular, moment, controllers) {
  'use strict';

  controllers.controller('DocumentListController', DocumentListController);

  DocumentListController.$inject = ['$scope', '$uibModal', '$dialog', '$rootElement', '$rootScope', '$state', '$filter',
    '$log', '$q', '$timeout', 'documentList', 'config', 'ContactService', 'AssignmentService', 'DocumentService', 'FileService', 'settings'
  ];

  function DocumentListController ($scope, $modal, $dialog, $rootElement, $rootScope, $state, $filter, $log, $q, $timeout, documentList,
      config, ContactService, AssignmentService, DocumentService, FileService, settings) {
    $log.debug('Controller: DocumentListController');

    var vm = this;
    var defaultDocumentStatus = ['1', '2']; // 1: 'awaiting upload' | 2: 'awaiting approval

    vm.dueThisWeek = 0;
    vm.dueToday = 0;
    vm.list = documentList;
    vm.listFiltered = [];
    vm.listOngoing = [];
    vm.listPaginated = [];
    vm.overdue = 0;
    vm.dpOpened = {
      filterDates: {}
    };
    vm.dueFilters = [
      { badgeClass: 'danger', calendarView: 'month', value: 'overdue' },
      { badgeClass: 'primary', calendarView: 'month', value: 'dueInNextFortnight' },
      { badgeClass: 'primary', calendarView: 'month', value: 'dueInNinetyDays' }
    ];
    vm.filterParams = {
      contactId: null,
      documentStatus: [],
      ownership: $state.params.ownership || null,
      dateRange: {
        from: null,
        until: null
      },
      due: null,
      assignmentType: []
    };
    vm.filterParamsHolder = {
      documentStatus: defaultDocumentStatus,
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
      filterDates: false
    };
    vm.label = {
      addNew: 'Add Document',
      overdue: 'Overdue',
      dueInNextFortnight: 'Due in next fortnight',
      dueInNinetyDays: 'Due in 90 days',
      dateRange: ''
    };
    vm.pagination = {
      currentPage: 1,
      itemsPerPage: 10,
      maxSize: 5
    };

    vm.apply = apply;
    vm.applySidebarFilters = applySidebarFilters;
    vm.changeStatus = changeStatus;
    vm.filterByDateField = filterByDateField;
    vm.deleteDocument = deleteDocument;
    vm.labelDateRange = labelDateRange;
    vm.viewInCalendar = viewInCalendar;

    (function init () {
      subscribeForEvents();
      watchForChanges();
      vm.applySidebarFilters();

      DocumentService.cacheContactsAndAssignments(documentList).then(function () {
        $rootScope.$broadcast('ct-spinner-hide');
        $log.debug($rootScope.cache);
      });
    })();

    /**
     * Apply action to delete the given list of documents
     *
     * @param {string} action
     * @param {array} documentList
     */
    function apply (action, documentList) {
      var documentListLen = documentList.length;
      var documentListPromise = [];
      var i;

      if (!action || !documentListLen) {
        return;
      }

      switch (action) {
        case 'delete':

          $dialog.open({
            msg: 'Are you sure you want to delete ' + documentListLen + ' document(s)?'
          }).then(function (confirm) {
            if (!confirm) {
              return;
            }

            $scope.$broadcast('ct-spinner-show', 'documentList');

            i = 0;
            for (; i < documentListLen; i++) {
              documentListPromise.push(DocumentService.delete(documentList[i].id));
            }

            $q.all(documentListPromise).then(function (results) {
              i = 0;

              for (; i < documentListLen; i++) {
                $rootScope.$broadcast('documentDelete', documentList[i].id);
                $scope.list.splice($scope.list.indexOf(documentList[i]), 1);
              }

              $scope.$broadcast('ct-spinner-hide', 'documentList');
              AssignmentService.updateTab();
            });
          });

          break;
      }
    }

    /**
     * Applies the filters on the sidebar
     */
    function applySidebarFilters () {
      vm.filterParams.dateRange.from = vm.filterParamsHolder.dateRange.from;
      vm.filterParams.dateRange.until = vm.filterParamsHolder.dateRange.until;
      vm.filterParams.due = 'dateRange';

      vm.labelDateRange();
    }

    /**
     * Updates the given document with new document's statusId
     *
     * @param {object} document
     * @param {string} statusId
     */
    function changeStatus (document, statusId) {
      if (!statusId || typeof +statusId !== 'number') {
        return null;
      }

      $scope.$broadcast('ct-spinner-show', 'documentList');

      DocumentService.save({
        id: document.id,
        status_id: statusId
      }).then(function (results) {
        document.id = results.id;
        document.status_id = results.status_id;
        $scope.$broadcast('ct-spinner-hide', 'documentList');
        AssignmentService.updateTab();
      });
    }

    /**
     * Filters the documents list based on filter type and due date
     * @param {string} type filter type
     * @return {array} documents list
     */
     function filterByDateField (type) {
       var listByDueDate = $filter('filterByDateField')(vm.list, type, 'activity_date_time', vm.filterParams.dateRange);
       var listByExpiryDate = $filter('filterByDateField')(vm.list, type, 'expire_date', vm.filterParams.dateRange);

       return _.uniq(_.union(listByDueDate, listByExpiryDate), 'id');
     };

    /**
     * Creates the date range label using from and until dates in
     * format 'dd/MM/yyyy'
     *
     * @param {string} from
     * @param {string} until
     */
    function labelDateRange () {
      var filterDateTimeFrom = $filter('date')(vm.filterParams.dateRange.from, 'dd/MM/yyyy') || '';
      var filterDateTimeUntil = $filter('date')(vm.filterParams.dateRange.until, 'dd/MM/yyyy') || '';

      if (filterDateTimeUntil) {
        filterDateTimeUntil = !filterDateTimeFrom ? 'Until: ' + filterDateTimeUntil : ' - ' + filterDateTimeUntil;
      }

      if (filterDateTimeFrom) {
        filterDateTimeFrom = !filterDateTimeUntil ? 'From: ' + filterDateTimeFrom : filterDateTimeFrom;
      }

      vm.label.dateRange = filterDateTimeFrom + filterDateTimeUntil;
    }

    /**
     * Deletes the given document
     *
     * @param {object} document
     */
    function deleteDocument (document) {
      $dialog.open({
        msg: 'Are you sure you want to delete this document?'
      }).then(function (confirm) {
        if (!confirm) {
          return;
        }

        DocumentService.delete(document.id).then(function (results) {
          vm.list.splice(vm.list.indexOf(document), 1);

          $rootScope.$broadcast('documentDelete', document.id);
          AssignmentService.updateTab();
        });
      });
    }

    /**
     * Navigates to calander view
     *
     * @param {string} view
     */
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

    /**
     * Adds or Removes Document fom the document list
     * "3" => approved & 4 => rejected
     * @param array list
     * @param object output
     * @param object input
     */
    function addRemoveDocument (list, output, input) {
      switch (true) {
        case (output.status_id !== '3') && (output.status_id !== '4') && (!input.status_id):
          list.push(output);
          break;
      }
    }

    // Subscribers for event listeners
    function subscribeForEvents () {
      // Updates document with given list of documents
      $scope.$on('assignmentFormSuccess', function (e, output) {
        Array.prototype.push.apply(vm.list, output.documentList);
      });

      // Calls addRemoveDocument function to add or remove the document in or from the list
      $scope.$on('documentFormSuccess', function (e, output, input) {
        if (angular.equals({}, input)) {
          addRemoveDocument(vm.list, output, input);
        } else {
          angular.extend(input, output);
        }
      });

      // For data with success status, if the pattern of messages matchses
      // assignment cache is cleared and the current state is reloaded.
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
    }

    // Execute watchers for the changes
    function watchForChanges () {
      // Whenever the date filters will change, their corrispondent
      // datepickers will have the minDate or maxDate setting updated
      // accordingly
      $scope.$watch('filterParamsHolder.dateRange.from', function (newValue) {
        vm.datepickerOptions.until.minDate = newValue;
      });

      $scope.$watch('filterParamsHolder.dateRange.until', function (newValue) {
        vm.datepickerOptions.from.maxDate = newValue;
      });
    }
  }
});
