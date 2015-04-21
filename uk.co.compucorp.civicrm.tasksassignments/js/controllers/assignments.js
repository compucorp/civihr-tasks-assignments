define(['controllers/controllers'], function(controllers){
    controllers.controller('AssignmentsCtrl',['$scope', '$log', '$modal', '$rootElement', '$rootScope', 'config',
        function($scope, $log, $modal, $rootElement, $rootScope, config){
            $log.debug('Controller: AssignmentsCtrl');

            $scope.assignmentsUrl = config.url.ASSIGNMENTS+'?reset=1';

            $rootScope.modalAssignment = function(data) {
                var data = data || {};

                    $modal.open({
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

            };
        }]);
});