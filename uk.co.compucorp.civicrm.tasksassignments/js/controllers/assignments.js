define([
    'controllers/controllers',
    'services/contact'
], function (controllers) {
    controllers.controller('AssignmentsCtrl', ['$scope', '$log', '$modal', '$rootElement', '$rootScope', '$state', 'config',
        function ($scope, $log, $modal, $rootElement, $rootScope, $state, config) {
            $log.info('Controller: AssignmentsCtrl');
        }
    ]);
});
