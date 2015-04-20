define(['directives/directives'], function(directives){
    directives.directive('taCiviEvents',['$rootScope','$log', function($rootScope, $log){
        $log.debug('Directive: taCiviEvents');

        return {
            link: function ($scope) {
                angular.element(document).on('crmFormSuccess', function(e, data) {
                    $scope.$broadcast('crmFormSuccess',data);
                });
            }
        }
    }]);
});