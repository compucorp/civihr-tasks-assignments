define(['controllers/controllers',
        'moment',
        'services/document'], function(controllers, moment){
    controllers.controller('DocumentCtrl',['$scope', '$log', '$rootScope', '$filter', 'DocumentService',
        function($scope, $log, $rootScope, $filter, DocumentService){
            $log.debug('Controller: DocumentCtrl');

            $scope.document.activity_date_time = moment($scope.document.activity_date_time).toDate();

            $scope.changeStatus = function(statusId){

                if (!statusId || typeof +statusId !== 'number') {
                    return null;
                }

                DocumentService.save({
                    id: $scope.document.id,
                    status_id: statusId
                }).then(function(results){
                    $scope.document.status_id = results.status_id;
                })
            }

            $scope.$watch('task.activity_date_time',function(documentDateTime){
                $scope.document.due = new Date(documentDateTime).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
            });

        }]);
});