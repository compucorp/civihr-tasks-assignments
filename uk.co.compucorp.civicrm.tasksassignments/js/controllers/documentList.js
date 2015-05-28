define(['controllers/controllers',
        'moment',
        'services/contact',
        'services/document',
        'services/assignment',
        'moment'], function(controllers, moment){

    controllers.controller('DocumentListCtrl',['$scope', '$modal', '$rootElement', '$rootScope', '$route', '$filter',
        '$log', 'documentList', 'config', 'ContactService', 'AssignmentService', 'DocumentService',
        function($scope, $modal, $rootElement, $rootScope, $route, $filter, $log, documentList, config, ContactService,
                 AssignmentService, DocumentService){
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
            }

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
            }

            $scope.dueToday = 0;
            $scope.dueThisWeek = 0;
            $scope.overdue = 0;
            $scope.documentList = documentList;

            $scope.dpOpened = {
                filterDates: {}
            }

            $scope.isCollapsed = {
                filterAdvanced: true,
                filterDates: true
            };

            $scope.filterParams = {
                contactId: null,
                documentStatus: [],
                userRole: null,
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

            $scope.labelDateRange = function(){
                var filterDateTimeFrom = $filter('date')($scope.filterParams.dateRange.from, 'dd/MM/yyyy') || '',
                    filterDateTimeUntil = $filter('date')($scope.filterParams.dateRange.until, 'dd/MM/yyyy') || '';

                if (filterDateTimeUntil) {
                    filterDateTimeUntil = !filterDateTimeFrom ? 'Until: ' + filterDateTimeUntil : ' - ' + filterDateTimeUntil;
                }

                if (filterDateTimeFrom) {
                    filterDateTimeFrom = !filterDateTimeUntil ? 'From: ' + filterDateTimeFrom : filterDateTimeFrom;
                }

                $scope.label.dateRange = filterDateTimeFrom + filterDateTimeUntil;
            }

            $rootScope.modalDocument = function(data) {
                    var data = data || {},
                    modalInstance = $modal.open({
                        targetDomEl: $rootElement.find('div').eq(0),
                        templateUrl: config.path.TPL+'modal/document.html?v='+(new Date().getTime()),
                        controller: 'ModalDocumentCtrl',
                        resolve: {
                            data: function(){
                                return data;
                            }
                        }
                    });

                modalInstance.result.then(function(results){
                    angular.equals({}, data) ? $scope.documentList.push(results) : angular.extend(data,results);
                }, function(){
                    $log.info('Modal dismissed');
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
                    Array.prototype.push.apply($scope.documentList,results);
                }, function(){
                    $log.info('Modal dismissed');
                });

            };

            $scope.deleteDocument = function(document){
                 DocumentService.delete(document.id).then(function(results){
                     $scope.documentList.splice($scope.documentList.indexOf(document),1);
                 });
            }

            $scope.$on('crmFormSuccess',function(e, data){
                if (data.status == 'success')  {
                    var pattern = /case|activity/i;

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