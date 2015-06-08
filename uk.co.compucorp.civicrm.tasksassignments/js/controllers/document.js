define(['controllers/controllers',
        'moment',
        'services/document'], function(controllers, moment){
    controllers.controller('DocumentCtrl',['$scope', '$log',
        function($scope, $log){
            $log.debug('Controller: DocumentCtrl');

            $scope.document.activity_date_time = !!$scope.document.activity_date_time ? moment($scope.document.activity_date_time).toDate() : null;
            $scope.document.expire_date = !!$scope.document.expire_date ? moment($scope.document.expire_date).toDate() : null;

            $scope.$watch('document.activity_date_time',function(documentDateTime){
                $scope.document.due = new Date(documentDateTime).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
            });

        }]);
});