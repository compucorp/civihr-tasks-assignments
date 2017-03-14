define([
    'common/moment',
    'tasks-assignments/controllers/controllers',
    'tasks-assignments/services/contact',
    'tasks-assignments/services/document',
    'tasks-assignments/services/file',
    'tasks-assignments/services/assignment',
], function (moment, controllers) {
    'use strict';

    controllers.controller('DocumentListCtrl',['$scope', '$uibModal', '$dialog', '$rootElement', '$rootScope', '$state', '$filter',
        '$log', '$q', '$timeout', 'documentList', 'config', 'ContactService', 'AssignmentService', 'DocumentService', 'FileService', 'settings',
        function ($scope, $modal, $dialog, $rootElement, $rootScope, $state, $filter, $log, $q, $timeout, documentList,
                 config, ContactService, AssignmentService, DocumentService, FileService, settings) {
            $log.debug('Controller: DocumentListCtrl');

            this.init = function(){
                var contactIds = this.contactIds,
                    assignmentIds = this.assignmentIds;

                this.collectId(documentList);

                if (contactIds && contactIds.length) {
                    ContactService.get({'IN': contactIds}).then(function(data){
                        ContactService.updateCache(data);
                    });
                }

                if (assignmentIds && assignmentIds.length && settings.extEnabled.assignments) {
                    AssignmentService.get({'IN': assignmentIds}).then(function(data){
                        AssignmentService.updateCache(data);
                    });
                }

                watchDateFilters();

                $rootScope.$broadcast('ct-spinner-hide');
                $log.debug($rootScope.cache);
            };

            this.assignmentIds = [];
            this.contactIds = [];

            this.collectId = function(documentList){
                var contactIds = this.contactIds,
                    assignmentIds = this.assignmentIds;

                contactIds.push(config.LOGGED_IN_CONTACT_ID);

                if (config.CONTACT_ID) {
                    contactIds.push(config.CONTACT_ID);
                }

                function collectCId(document) {
                    contactIds.push(document.source_contact_id);

                    if (document.assignee_contact_id && document.assignee_contact_id.length) {
                        contactIds.push(document.assignee_contact_id[0]);
                    }

                    if (document.target_contact_id && document.target_contact_id.length) {
                        contactIds.push(document.target_contact_id[0]);
                    }
                }

                function collectAId(document) {
                    if (document.case_id) {
                        assignmentIds.push(document.case_id);
                    }
                }

                angular.forEach(documentList,function(document){
                    collectCId(document);
                    collectAId(document);
                });
            };

            $scope.pagination = {
                currentPage: 1,
                itemsPerPage: 10,
                maxSize: 5
            };

            $scope.dueFilters = [
              { badgeClass: 'danger', calendarView: 'month', value: 'overdue' },
              { badgeClass: 'primary', calendarView: 'month', value: 'dueInNextFortnight' },
              { badgeClass: 'primary', calendarView: 'month', value: 'dueInNinetyDays' }
            ];

            $scope.dueToday = 0;
            $scope.dueThisWeek = 0;
            $scope.overdue = 0;
            $scope.list = documentList;
            $scope.listFiltered = [];
            $scope.listOngoing = [];
            $scope.listPaginated = [];
            $scope.listResolved = [];
            $scope.listResolvedLoaded = false;

            $scope.dpOpened = {
                filterDates: {}
            };

            $scope.isCollapsed = {
                filterAdvanced: true,
                filterDates: true,
                documentListResolved: true
            };

            $scope.filterParams = {
              contactId: null,
              documentStatus: [],
              ownership: $state.params.ownership ||  null,
              dateRange: {
                from: null,
                until: null
              },
              due: null,
              assignmentType: []
            };

            $scope.filterParamsHolder = {
                documentStatus: [],
                dateRange: {
                    from: moment().startOf('day').toDate(),
                    until: moment().add(1, 'month').startOf('day').toDate()
                }
            };

            $scope.datepickerOptions = {
                from: { maxDate: $scope.filterParamsHolder.dateRange.until },
                until: { minDate: $scope.filterParamsHolder.dateRange.from }
            };

            $scope.label = {
                addNew: 'Add Document',
                overdue: 'Overdue',
                dueInNextFortnight: 'Due in next fortnight',
                dueInNinetyDays: 'Due in 90 days',
                dateRange: ''
            };

            $scope.apply = function(action, documentList){

                var documentListLen = documentList.length,
                    documentListPromise = [],
                    i;

                if (!action || !documentListLen) {
                    return
                }

                switch (action) {
                    case 'delete':

                        $dialog.open({
                            msg: 'Are you sure you want to delete ' + documentListLen + ' document(s)?'
                        }).then(function(confirm){

                            if (!confirm) {
                                return
                            }

                            $scope.$broadcast('ct-spinner-show','documentList');

                            i = 0;
                            for (; i < documentListLen; i++) {
                                documentListPromise.push(DocumentService.delete(documentList[i].id));
                            }

                            $q.all(documentListPromise).then(function(results){
                              i = 0;

                              for (; i < documentListLen; i++) {
                                $rootScope.$broadcast('documentDelete', documentList[i].id);
                                $scope.list.splice($scope.list.indexOf(documentList[i]),1);
                              }

                              $scope.$broadcast('ct-spinner-hide','documentList');
                              AssignmentService.updateTab();
                            });

                        });

                        break;
                }
            };

            /**
             * Applies the filters on the sidebar
             */
            $scope.applySidebarFilters = function () {
              $scope.filterParams.dateRange.from = $scope.filterParamsHolder.dateRange.from;
              $scope.filterParams.dateRange.until = $scope.filterParamsHolder.dateRange.until;
              $scope.filterParams.documentStatus = $scope.filterParamsHolder.documentStatus;
              $scope.filterParams.due = 'dateRange';

              $scope.labelDateRange();
            };

            $scope.changeStatus = function(document, statusId){

                if (!statusId || typeof +statusId !== 'number') {
                    return null;
                }

                $scope.$broadcast('ct-spinner-show','documentList');

                DocumentService.save({
                    id: document.id,
                    status_id: statusId
                }).then(function(results){
                    document.id = results.id;
                    document.status_id = results.status_id;
                    $rootScope.$broadcast('documentFormSuccess', results, document);
                    $scope.$broadcast('ct-spinner-hide','documentList');
                    AssignmentService.updateTab();
                })
            };

            $scope.labelDateRange = function(from, until){
              var filterDateTimeFrom = $filter('date')($scope.filterParams.dateRange.from, 'dd/MM/yyyy') || '',
                  filterDateTimeUntil = $filter('date')($scope.filterParams.dateRange.until, 'dd/MM/yyyy') || '';

              if (filterDateTimeUntil) {
                filterDateTimeUntil = !filterDateTimeFrom ? 'Until: ' + filterDateTimeUntil : ' - ' + filterDateTimeUntil;
              }

              if (filterDateTimeFrom) {
                filterDateTimeFrom = !filterDateTimeUntil ? 'From: ' + filterDateTimeFrom : filterDateTimeFrom;
              }

              $scope.label.dateRange = filterDateTimeFrom + filterDateTimeUntil;
            };

            $scope.loadDocumentsResolved = function(){
              if ($scope.listResolvedLoaded) {
                return;
              }

              var ctrl = this;

              //Remove resolved documents from the document list
              $scope.list = $filter('filterByStatus')($scope.list, $rootScope.cache.documentStatusResolve, false);

              DocumentService.get({
                'target_contact_id': config.CONTACT_ID,
                'status_id': {
                  'IN': config.status.resolve.DOCUMENT
                }
              }).then(function(documentListResolved){
                var contactIds = ctrl.contactIds,
                    assignmentIds = ctrl.assignmentIds;

                ctrl.collectId(documentListResolved);

                if (contactIds && contactIds.length) {
                  ContactService.get({'IN': contactIds}).then(function(data){
                    ContactService.updateCache(data);
                  });
                }

                if (assignmentIds && assignmentIds.length && settings.extEnabled.assignments) {
                  AssignmentService.get({'IN': assignmentIds}).then(function(data){
                    AssignmentService.updateCache(data);
                  });
                }

                Array.prototype.push.apply($scope.list, documentListResolved);
                $scope.listResolvedLoaded = true;
              });
            }.bind(this);

            $scope.deleteDocument = function(document){
              $dialog.open({
                msg: 'Are you sure you want to delete this document?'
              }).then(function(confirm){
                if (!confirm) {
                  return
                }

                DocumentService.delete(document.id).then(function(results){
                  $scope.list.splice($scope.list.indexOf(document),1);

                  $rootScope.$broadcast('documentDelete', document.id);
                  AssignmentService.updateTab();
                });
              });
            };

            $scope.viewInCalendar = function(view){
                $state.go('calendar.mwl.'+view);
            };

            $scope.$on('assignmentFormSuccess',function(e, output){
              Array.prototype.push.apply($scope.list, output.documentList);
            });

            $scope.$on('documentFormSuccess',function(e, output, input){
              angular.equals({}, input) ? $scope.list.push(output) : angular.extend(input,output);
            });

            $scope.$on('crmFormSuccess',function(e, data){
                if (data.status == 'success')  {
                    var pattern = /case|activity|assignment/i;

                    if (pattern.test(data.title) ||
                        (data.crmMessages && data.crmMessages.length) &&
                        (pattern.test(data.crmMessages[0].title) ||
                        pattern.test(data.crmMessages[0].text))) {
                        $rootScope.cache.assignment = {
                            obj: {},
                            arr: []
                        };
                        $state.go($state.current, {}, {reload: true});
                    }
                }
            });

            this.init();

            /**
             * Whenever the date filters will change, their corrispondent
             * datepickers will have the minDate or maxDate setting updated
             * accordingly
             */
            function watchDateFilters() {
              $scope.$watch('filterParamsHolder.dateRange.from', function (newValue) {
                $scope.datepickerOptions.until.minDate = newValue;
              });

              $scope.$watch('filterParamsHolder.dateRange.until', function (newValue) {
                $scope.datepickerOptions.from.maxDate = newValue;
              });
            }
        }]);
});
