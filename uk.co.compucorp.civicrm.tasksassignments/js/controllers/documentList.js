define(['controllers/controllers',
        'services/contact',
        'services/document',
        'services/assignment'], function(controllers){

    controllers.controller('DocumentListCtrl',['$scope', '$modal', '$rootElement', '$rootScope', '$route', '$filter',
        '$log', 'documentList', 'config', 'ContactService', 'AssignmentService', 'DocumentService',
        function($scope, $modal, $rootElement, $rootScope, $route, $filter, $log, documentList, config, ContactService,
                 AssignmentService, DocumentService){
            $log.debug('Controller: DocumentListCtrl');

            console.log(documentList);

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

            $scope.filterBy = {
                contactId: null,
                userRole: null,
                date: {
                    from: null,
                    until: null
                },
                due: null,
                assignmentType: []
            };

            $scope.label = {
                addNew: 'Add Document',
                overdue: 'Overdue',
                dueToday: 'Due Today',
                dueThisWeek: 'Due This Week',
                dateRange: ''
            };

            $scope.labelDateRange = function(){
                var filterDateTimeFrom = $filter('date')($scope.filterBy.date.from, 'dd/MM/yyyy') || '',
                    filterDateTimeUntil = $filter('date')($scope.filterBy.date.until, 'dd/MM/yyyy') || '';

                if (filterDateTimeUntil) {
                    filterDateTimeUntil = !filterDateTimeFrom ? 'Until: ' + filterDateTimeUntil : ' - ' + filterDateTimeUntil;
                }

                if (filterDateTimeFrom) {
                    filterDateTimeFrom = !filterDateTimeUntil ? 'From: ' + filterDateTimeFrom : filterDateTimeFrom;
                }

                $scope.label.dateRange = filterDateTimeFrom + filterDateTimeUntil;
            }

            $scope.tasksFilterFn = {
                dateRange: function(task){
                    var taskDateTime = new Date(task.activity_date_time).setHours(0, 0, 0, 0),
                        filterDateTimeFrom = $scope.filterBy.date.from ? new Date($scope.filterBy.date.from).setHours(0, 0, 0, 0) : -Infinity,
                        filterDateTimeUntil = $scope.filterBy.date.until ? new Date($scope.filterBy.date.until).setHours(0, 0, 0, 0) : Infinity;

                    return  taskDateTime >= filterDateTimeFrom && taskDateTime <= filterDateTimeUntil;
                },
                overdue: function(task){
                    return new Date(task.activity_date_time).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
                },
                dueToday: function(task){
                    return new Date(task.activity_date_time).setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0);
                },
                dueThisWeek: function(task){
                    var d = new Date(),
                        day = d.getDay(),
                        diff = d.getDate() - day + (day == 0 ? -6:1),
                        mon = new Date(d.setDate(diff)),
                        sun = new Date(d.setDate(mon.getDate()+7)),
                        taskDateTime = new Date(task.activity_date_time).setHours(0, 0, 0, 0);

                    return  taskDateTime >= mon.setHours(0, 0, 0, 0) && taskDateTime < sun.setHours(0, 0, 0, 0);
                },
                myTasks: function(task){
                    return task.assignee_contact_id == config.LOGGED_IN_CONTACT_ID
                },
                delegatedTasks: function(task){
                    return task.source_contact_id == config.LOGGED_IN_CONTACT_ID
                }
                ,
                assignmentType: function(task){
                    var assignment = $rootScope.cache.assignment.obj[task.case_id];

                    if (!$scope.filterBy.assignmentType.length) {
                        return true;
                    }

                    if (assignment) {
                        return $scope.filterBy.assignmentType.indexOf(assignment.case_type_id) !== -1
                    }

                    return false;
                },
                contactId: function(task) {
                    var contactId = $scope.filterBy.contactId;
                    return !contactId || +task.assignee_contact_id[0] === +contactId || +task.source_contact_id === +contactId || +task.target_contact_id === +contactId;
                }
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