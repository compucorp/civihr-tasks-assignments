define(['controllers/controllers',
        'services/contact',
        'services/task'], function(controllers){

    controllers.controller('ModalTaskCtrl',['$scope', '$modalInstance', '$rootScope', '$q', '$log', '$filter',
        'AssignmentService', 'TaskService', 'ContactService', 'data', 'config',
        function($scope, $modalInstance, $rootScope, $q, $log, $filter, AssignmentService, TaskService, ContactService,
                 data, config){
            $log.debug('Controller: ModalTaskCtrl');

            $scope.data = data;
            $scope.task = {}

            angular.copy(data,$scope.task);

            $scope.task.assignee_contact_id = $scope.task.assignee_contact_id || [];
            $scope.task.source_contact_id = $scope.task.source_contact_id || config.LOGGED_IN_CONTACT_ID;
            $scope.task.target_contact_id = $scope.task.target_contact_id || [config.CONTACT_ID];
            $scope.contacts = $rootScope.cache.contact.arrSearch;
            $scope.assignments = $rootScope.cache.assignment.arrSearch;
            $scope.showCId = !config.CONTACT_ID;

            $scope.cacheAssignment = function($item){

                if ($rootScope.cache.assignment.obj[$item.id]) {
                    return
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
                    is_deleted: $item.label_class == 'strikethrough' ? '1' : '0',
                    start_date: $item.extra.start_date,
                    subject: $item.extra.case_subject
                };

                AssignmentService.updateCache(obj);
            };

            $scope.cacheContact = function($item){
                var obj = {};

                obj[$item.id] = {
                    contact_id: $item.id,
                    contact_type: $item.icon_class,
                    sort_name: $item.label,
                    email: $item.description.length ? $item.description[0] : ''
                };

                ContactService.updateCache(obj);
            };

            $scope.refreshAssignments = function(input){
                if (!input) {
                    return
                }

                AssignmentService.search(input, $scope.task.case_id).then(function(results){
                    $scope.assignments = results;
                });
            }

            $scope.refreshContacts = function(input){
                if (!input) {
                    return
                }

                ContactService.search(input, {
                    contact_type: 'Individual'
                }).then(function(results){
                    $scope.contacts = results;
                });
            }

            $scope.dpOpen = function($event){
                $event.preventDefault();
                $event.stopPropagation();

                $scope.dpOpened = true;

            }

            $scope.cancel = function(){
                $modalInstance.dismiss('cancel');
            }

            $scope.confirm = function(){
                console.log($scope.task);
                console.log(angular.equals($scope.task,data));

                $scope.task.activity_date_time = $scope.task.activity_date_time || new Date();

                TaskService.save($scope.task).then(function(results){
                    AssignmentService.updateTab();
                    $modalInstance.close(angular.extend(results,$scope.task));
                },function(reason){
                    CRM.alert(reason, 'Error', 'error');
                    $modalInstance.dismiss();
                    return $q.reject();
                });

            }

        }]);
});