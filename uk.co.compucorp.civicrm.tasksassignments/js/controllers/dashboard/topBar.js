define(['controllers/controllers'], function(controllers){
    controllers.controller('TopBarCtrl',['$scope', '$rootScope', '$location', '$log',
        function($scope, $rootScope, $location, $log){
            $log.debug('Controller: TopBarCtrl');

            $rootScope.itemAdd = {};
            $rootScope.itemAdd.fn = function(){
                $location.path() == '/documents' ? $rootScope.modalDocument() : $rootScope.modalTask();
            };
            $rootScope.itemAdd.label = function(){
                return $location.path() == '/documents' ? 'Add Document' : 'Add Task';
            };

        }]);
});