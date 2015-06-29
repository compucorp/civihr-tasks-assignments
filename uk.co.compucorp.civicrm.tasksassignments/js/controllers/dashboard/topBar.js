define(['controllers/controllers'], function(controllers){
    controllers.controller('TopBarCtrl',['$scope', '$rootScope', '$state', '$log',
        function($scope, $rootScope, $state, $log){
            $log.debug('Controller: TopBarCtrl');

            $rootScope.itemAdd = {};
            $rootScope.itemAdd.fn = function(){
                $state.includes('documents') ? $rootScope.modalDocument() : $rootScope.modalTask();
            };
            $rootScope.itemAdd.label = function(){
                return $state.includes('documents') ? 'Add Document' : 'Add Task';
            };

        }]);
});