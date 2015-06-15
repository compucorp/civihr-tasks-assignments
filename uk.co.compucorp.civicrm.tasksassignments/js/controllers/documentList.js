define(['controllers/controllers',
        'moment',
        'services/contact',
        'services/document',
        'services/file',
        'services/assignment',
        'moment'], function(controllers, moment){

    controllers.controller('DocumentListCtrl',['$scope', '$modal', '$dialog', '$rootElement', '$rootScope', '$route', '$filter',
        '$log', '$q', '$timeout', '$state', 'documentList', 'config', 'ContactService', 'AssignmentService', 'DocumentService', 'FileService', 'settings',
        function($scope, $modal, $dialog, $rootElement, $rootScope, $route, $filter, $log, $q, $timeout, $state, documentList,
                 config, ContactService, AssignmentService, DocumentService, FileService, settings){
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

                if (assignmentIds && assignmentIds.length) {
                    AssignmentService.get({'IN': assignmentIds}).then(function(data){
                        AssignmentService.updateCache(data);
                    });
                }

                $rootScope.$broadcast('ct-spinner-hide');
                console.log($rootScope.cache);
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

            $scope.dueToday = 0;
            $scope.dueThisWeek = 0;
            $scope.overdue = 0;
            $scope.documentList = documentList;
            $scope.documentListFiltered = [];
            $scope.documentListOngoing = [];
            $scope.documentListPaginated = [];
            $scope.documentListResolved = [];
            $scope.documentListResolvedLoaded = false;
            $scope.actionApplyTo = 'selected';

            $scope.checklist = {
                selected: {},
                isCheckedAll: {}
            };

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
                userRole: {
                    field: null,
                    isEqual: null
                },
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
                    from: new Date().setHours(0, 0, 0, 0),
                    until: moment().add(1, 'month').toDate().setHours(0, 0, 0, 0)
                }
            };

            $scope.label = {
                addNew: 'Add Document',
                overdue: 'Overdue',
                dueToday: 'Due Today',
                dueThisWeek: 'Due This Week',
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
                                    $scope.documentList.splice($scope.documentList.indexOf(documentList[i]),1);
                                }
                                $scope.checklist.isCheckedAll = {};
                                $scope.checklist.selected = {};
                                $scope.$broadcast('ct-spinner-hide','documentList');
                            });

                        });

                        break;
                }
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
                    $scope.$broadcast('ct-spinner-hide','documentList');
                })
            };

            $scope.toggleAll = function(page){
                $scope.checklist.isCheckedAll[page] ? $scope.checklist.selected[page] = angular.copy($scope.documentListPaginated) : $scope.checklist.selected[page] = [];
            };

            $scope.toggleIsCheckedAll = function() {
                $timeout(function(){
                    $scope.checklist.isCheckedAll[$scope.pagination.currentPage] = $scope.checklist.selected[$scope.pagination.currentPage].length == $scope.documentListPaginated.length;
                });
            };

            $scope.labelDateRange = function(from, until){
                var filterDateTimeFrom = $filter('date')(from, 'dd/MM/yyyy') || '',
                    filterDateTimeUntil = $filter('date')(until, 'dd/MM/yyyy') || '';

                if (filterDateTimeUntil) {
                    filterDateTimeUntil = !filterDateTimeFrom ? 'Until: ' + filterDateTimeUntil : ' - ' + filterDateTimeUntil;
                }

                if (filterDateTimeFrom) {
                    filterDateTimeFrom = !filterDateTimeUntil ? 'From: ' + filterDateTimeFrom : filterDateTimeFrom;
                }

                $scope.label.dateRange = filterDateTimeFrom + filterDateTimeUntil;
            };

            $scope.loadDocumentsResolved = function(){

                if ($scope.documentListResolvedLoaded) {
                    return;
                }

                //Remove resolved documents from the document list
                $scope.documentList = $scope.documentListOngoing;

                DocumentService.get({
                    'target_contact_id': config.CONTACT_ID,
                    'status_id': {
                        'IN': config.status.resolve.DOCUMENT
                    }
                }).then(function(documentListResolved){
                    $scope.documentList.push.apply($scope.documentList, documentListResolved);
                    $timeout(function () {
                        $scope.documentListResolvedLoaded = true;
                    });
                });
            };

            $rootScope.modalDocument = function(data, e) {
                e && e.preventDefault();

                var data = data || {},
                    modalInstance = $modal.open({
                    targetDomEl: $rootElement.find('div').eq(0),
                    templateUrl: config.path.TPL+'modal/document.html?v='+(new Date().getTime()),
                    controller: 'ModalDocumentCtrl',
                    resolve: {
                        data: function(){
                            return data;
                        },
                        files: function(){

                            if (!data.id || !+data.file_count) {
                                return [];
                            }

                            return FileService.get(data.id,'civicrm_activity')
                        }
                    }
                });

                modalInstance.result.then(function(results){
                    angular.equals({}, data) ? $scope.documentList.push(results) : angular.extend(data,results);
                }, function(){
                    $log.info('Modal dismissed');
                });
            };

            $rootScope.modalReminder = function(data) {
                var data = data || {};

                $modal.open({
                    targetDomEl: $rootElement.find('div').eq(0),
                    templateUrl: config.path.TPL+'modal/reminder.html?v='+(new Date().getTime()),
                    controller: 'ModalReminderCtrl',
                    resolve: {
                        data: function(){
                            return data;
                        },
                        type: function(){
                            return 'document'
                        }
                    }
                });
            };

            $rootScope.modalAssignment = function(data) {
                var data = data || {},
                    modalInstance = $modal.open({
                        targetDomEl: $rootElement.find('div').eq(0),
                        templateUrl: config.path.TPL+'modal/assignment.html?v='+(new Date().getTime()),
                        controller: 'ModalAssignmentCtrl',
                        size: 'lg',
                        resolve: {
                            data: function(){
                                return data;
                            }
                        }
                    });

                modalInstance.result.then(function(results){
                    Array.prototype.push.apply($scope.documentList,results.documentList);
                }, function(){
                    $log.info('Modal dismissed');
                });

            };

            $scope.deleteDocument = function(document){

                $dialog.open({
                    msg: 'Are you sure you want to delete this document?'
                }).then(function(confirm){
                    if (!confirm) {
                        return
                    }

                    DocumentService.delete(document.id).then(function(results){
                        $scope.documentList.splice($scope.documentList.indexOf(document),1);
                        $scope.checklist.selected.splice($scope.checklist.selected.indexOf(document),1);
                    });
                });

            };

            $scope.$on('crmFormSuccess',function(e, data){
                if (data.status == 'success')  {
                    var pattern = /case|activity|assignment/i;

                    if (pattern.test(data.title) ||
                        data.crmMessages.length &&
                        (pattern.test(data.crmMessages[0].title) ||
                        pattern.test(data.crmMessages[0].text))) {
                        $rootScope.cache.assignment = {
                            obj: {},
                            arr: []
                        };
                        $route.reload();
                    }
                }
            });

            this.init();

        }]);
});