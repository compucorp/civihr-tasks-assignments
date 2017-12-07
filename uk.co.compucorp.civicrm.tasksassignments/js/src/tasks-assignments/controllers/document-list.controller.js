/* eslint-env amd */

define([
  'common/angular',
  'common/lodash',
  'common/moment'
], function (angular, _, moment) {
  'use strict';

  DocumentListController.__name = 'DocumentListController';
  DocumentListController.$inject = [
    '$filter', '$log', '$q', '$rootElement', '$rootScope', '$scope', '$timeout',
    '$dialog', '$uibModal', '$state', 'AssignmentService', 'ContactService',
    'DocumentService', 'FileService', 'config', 'settings', 'documentList'
  ];

  function DocumentListController ($filter, $log, $q, $rootElement, $rootScope,
    $scope, $timeout, $dialog, $modal, $state, AssignmentService, ContactService,
    DocumentService, FileService, config, settings, documentList) {
    $log.debug('Controller: DocumentListController');

    var vm = this;
    var defaultDocumentStatus = ['1', '2']; // 1: 'awaiting upload' | 2: 'awaiting approval

    vm.dueThisWeek = 0;
    vm.dueToday = 0;
    vm.isDocumentSection = false;
    vm.list = documentList;
    vm.listFiltered = [];
    vm.listOngoing = [];
    vm.listPaginated = [];
    vm.overdue = 0;
    vm.propertyName = 'activity_date_time';
    vm.reverse = true;
    vm.documentContactColumns = [
      {
        label: 'Type',
        property: 'type'
      },
      {
        label: 'Document Number',
        property: 'document_number'
      },
      {
        label: 'Assigned to',
        property: 'assignee'
      },
      {
        label: 'Workflow',
        property: 'case_id',
        condition: settings.extEnabled.assignments
      },
      {
        label: 'Valid From',
        property: 'valid_from'
      },
      {
        label: 'Expiry Date',
        property: 'expire_date'
      },
      {
        label: 'Status',
        property: 'status_id'
      }
    ];
    vm.documentDashboardColumns = [
      {
        label: 'Type',
        property: 'type'
      },
      {
        label: 'Staff',
        property: 'target_contact'
      },
      {
        label: 'Assigned to',
        property: 'assignee'
      },
      {
        label: 'Workflow',
        property: 'case_id',
        condition: settings.extEnabled.assignments
      },
      {
        label: 'Due Date',
        property: 'activity_date_time'
      },
      {
        label: 'Expiry Date',
        property: 'expire_date'
      },
      {
        label: 'Status',
        property: 'status_id'
      }
    ];
    vm.dpOpened = {
      filterDates: {}
    };
    vm.dueFilters = [
      { badgeClass: 'danger', calendarView: 'month', value: 'overdue' },
      { badgeClass: 'primary', calendarView: 'month', value: 'dueInNextFortnight' },
      { badgeClass: 'primary', calendarView: 'month', value: 'dueInNinetyDays' },
      { badgeClass: 'primary', calendarView: 'month', value: 'all' }
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
        from: null,
        until: null
      }
    };
    vm.datepickerOptions = {
      from: { maxDate: vm.filterParamsHolder.dateRange.until },
      until: { minDate: vm.filterParamsHolder.dateRange.from }
    };
    vm.isCollapsed = {
      filterAdvanced: true,
      filterDates: true
    };
    vm.label = {
      addNew: 'Add Document',
      overdue: 'Overdue',
      dueInNextFortnight: 'Next fortnight',
      dueInNinetyDays: '90 days',
      all: 'All',
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
    vm.deleteDocument = deleteDocument;
    vm.filterByDateField = filterByDateField;
    vm.labelDateRange = labelDateRange;
    vm.listAssignees = listAssignees;
    vm.sortBy = sortBy;
    vm.viewInCalendar = viewInCalendar;

    (function init () {
      initListeners();
      initWatchers();
      vm.applySidebarFilters();

      DocumentService.cacheContactsAndAssignments(documentList).then(function () {
        $rootScope.$broadcast('ct-spinner-hide');
        $log.debug($rootScope.cache);
      });
    })();

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
      vm.isDocumentSection = (vm.filterParamsHolder.dateRange.from !== null || vm.filterParamsHolder.dateRange.until !== null);

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
     * Filters the documents list based on filter type and due date
     * @param {string} type filter type
     * @return {array} documents list
     */
    function filterByDateField (type) {
      var listByDueDate = $filter('filterByDateField')(vm.list, type, 'activity_date_time', vm.filterParams.dateRange);
      var listByExpiryDate = $filter('filterByDateField')(vm.list, type, 'expire_date', vm.filterParams.dateRange);

      return _.uniq(_.union(listByDueDate, listByExpiryDate), 'id');
    }

    // Subscribers for event listeners
    function initListeners () {
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
    function initWatchers () {
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
     * Creates the list of contact name as  object
     * @param  {array} assigneesIds
     * @return {object}
     */
    function listAssignees (assigneesIds) {
      var assigneeList = {};

      if (assigneesIds.length) {
        _.each(assigneesIds, function (assigneeId) {
          var assignee = _.find($rootScope.cache.contact.obj, {'contact_id': assigneeId});

          if (assignee) {
            assigneeList[assigneeId] = assignee.sort_name.replace(',', '');
          }
        });
      }

      return assigneeList;
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
     * Sort the document list based on the property type
     * @param  {string} propertyName
     * @return {array}
     */
    function sortBy (propertyName) {
      vm.reverse = (vm.propertyName === propertyName) ? !vm.reverse : false;
      vm.propertyName = propertyName;

      switch (propertyName) {
        case 'type':
          vm.list = _.sortBy(vm.list, function (doc) {
            return $rootScope.cache.documentType.obj[doc.activity_type_id].toLowerCase();
          });
          break;
        case 'status_id':
          vm.list = _.sortBy(vm.list, function (doc) {
            return $rootScope.cache.documentStatus.obj[doc.status_id].toLowerCase();
          });
          break;
        case 'target_contact':
          vm.list = _.sortBy(vm.list, function (doc) {
            return $rootScope.cache.contact.obj[doc.target_contact_id[0]].sort_name.toLowerCase();
          });
          break;
        case 'assignee':
          vm.list = _.sortBy(vm.list, function (doc) {
            var assignee = doc.assignee_contact_id.length && _.find($rootScope.cache.contact.obj, {'id': doc.assignee_contact_id[0]});

            return assignee ? assignee.sort_name.toLowerCase() : '';
          });
          break;
        case 'case_id':
          vm.list = _.sortBy(vm.list, function (doc) {
            var assignment = $rootScope.cache.assignment.obj[doc.case_id];
            var assignmentType = assignment && $rootScope.cache.assignmentType.obj[assignment.case_type_id];

            return assignmentType && assignmentType.title.toLowerCase();
          });
          break;
      }
    }

    /**
     * Navigates to calander view
     *
     * @param {string} view
     */
    function viewInCalendar (view) {
      $state.go('calendar.mwl.' + view);
    }
  }

  return DocumentListController;
});
