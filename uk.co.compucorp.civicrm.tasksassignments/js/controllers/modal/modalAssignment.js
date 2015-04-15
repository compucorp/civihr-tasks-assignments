define(['controllers/controllers',
        'services/assignment'], function(controllers){
    controllers.controller('ModalAssignmentCtrl',['$scope', '$modalInstance', '$rootScope', '$q', '$log', '$filter',
         'AssignmentService', 'data', 'config',
        function($scope, $modalInstance, $rootScope, $q, $log, $filter, AssignmentService, data, config){
            $log.debug('Controller: ModalAssignmentCtrl');

            $scope.assignment = {};

            //angular.copy(data,$scope.assignment);
/*
            $scope.assignment.assignee_contact_id = $scope.assignment.assignee_contact_id || [];
            $scope.assignment.source_contact_id = $scope.assignment.source_contact_id || config.LOGGED_IN_CONTACT_ID;
            $scope.assignment.target_contact_id = $scope.assignment.target_contact_id || [config.CONTACT_ID];

            */
            $scope.assignment.status_id = $scope.assignment.status_id || 1;
            $scope.assignment.contact_id = $scope.assignment.contact_id || config.CONTACT_ID;
            $scope.assignment.client_id = $scope.assignment.client_id || config.CONTACT_ID;

            $scope.contacts = $rootScope.cache.contact.arrSearch;
            $scope.dpOpened = {};
            $scope.showCId = !config.CONTACT_ID;

            $scope.setData = function() {
                var assignmentType = $rootScope.cache.assignmentType[$scope.assignment.case_type_id];
                $scope.taskSet = assignmentType ? assignmentType.definition.activitySets[0] : null;
                $scope.assignment.subject = $rootScope.cache.assignmentType[$scope.assignment.case_type_id].title;
            }

            $scope.dpOpen = function($event, key){
                $event.preventDefault();
                $event.stopPropagation();

                $scope.dpOpened[key] = true;

            }

            $scope.cancel = function(){
                $modalInstance.dismiss('cancel');
            }

            $scope.confirm = function(){
                console.log($scope.assignment);

                AssignmentService.save($scope.assignment).then(function(results){
                    console.log(results);
                    //$modalInstance.close(angular.extend(results,$scope.assignment));
                },function(reason){
                    CRM.alert(reason, 'Error', 'error');
                    $modalInstance.dismiss();
                    return $q.reject();
                });

            }

        }]);
});