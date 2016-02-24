define([
    'tasks-assignments/controllers/controllers',
    'tasks-assignments/services/contact',
    'tasks-assignments/services/dialog',
    'tasks-assignments/services/task'
], function (controllers) {
    'use strict';

    controllers.controller('ModalTaskCtrl',['$scope', '$modalInstance', '$rootScope', '$rootElement', '$q', '$log', '$filter',
        '$modal', '$dialog', 'AssignmentService', 'TaskService', 'ContactService', 'data', 'config', 'HR_settings',
        function ($scope, $modalInstance, $rootScope, $rootElement, $q, $log, $filter, $modal, $dialog, AssignmentService, TaskService, ContactService,
                 data, config, HR_settings) {
            $log.debug('Controller: ModalTaskCtrl');

            $scope.format = HR_settings.DATE_FORMAT.toLowerCase();
            $scope.data = data;
            $scope.task = {};

            angular.copy(data, $scope.task);

            $scope.task.assignee_contact_id = $scope.task.assignee_contact_id || [];
            $scope.task.source_contact_id = $scope.task.source_contact_id || config.LOGGED_IN_CONTACT_ID;
            $scope.task.target_contact_id = $scope.task.target_contact_id || [config.CONTACT_ID];
            $scope.contacts = [];
            $scope.showCId = !config.CONTACT_ID;
            $scope.assignments = $filter('filter')($rootScope.cache.assignment.arrSearch, function(val){
                return +val.extra.contact_id == +$scope.task.target_contact_id;
            });

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

                var targetContactId = $scope.task.target_contact_id;

                AssignmentService.search(input, $scope.task.case_id).then(function(results){
                    $scope.assignments = $filter('filter')(results, function(val){
                        return +val.extra.contact_id == +targetContactId;
                    });
                });
            };

            $scope.refreshContacts = function(input){
                if (!input) {
                    return
                }

                ContactService.search(input, {
                    contact_type: 'Individual'
                }).then(function(results){
                    $scope.contacts = results;
                });
            };

            $scope.dpOpen = function($event){
                $event.preventDefault();
                $event.stopPropagation();

                $scope.dpOpened = true;

            };

            $scope.cancel = function(){

                if ($scope.taskForm.$pristine) {
                    $modalInstance.dismiss('cancel');
                    return
                }

                $dialog.open({
                    copyCancel: 'No',
                    msg: 'Are you sure you want to cancel? Changes will be lost!'
                }).then(function(confirm){
                    if (!confirm) {
                        return
                    }

                    $scope.$broadcast('ct-spinner-hide');
                    $modalInstance.dismiss('cancel');
                });

            };

            $scope.confirm = function(){

                if (angular.equals(data,$scope.task)) {
                    $modalInstance.dismiss('cancel');
                    return
                }

                $scope.$broadcast('ct-spinner-show');

                //temporary remove case_id
                +$scope.task.case_id == +data.case_id && delete $scope.task.case_id;
                $scope.task.activity_date_time = $scope.task.activity_date_time || new Date();

                TaskService.save($scope.task).then(function(results){

                    $scope.task.id = results.id;
                    $scope.task.case_id = results.case_id;

                    AssignmentService.updateTab();

                    if($scope.openNew){
                        $scope.task.open = true;
                        $scope.openNew = false;
                    }

                    $modalInstance.close($scope.task);
                    $scope.$broadcast('ct-spinner-hide');

                    return;
                },function(reason){
                    CRM.alert(reason, 'Error', 'error');
                    $modalInstance.dismiss();
                    $scope.$broadcast('ct-spinner-hide');
                    return $q.reject();
                });

            };
        }]);
});
