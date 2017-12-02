/* eslint-env amd */

define([
  'common/moment',
  'tasks-assignments/controllers/controllers',
  'tasks-assignments/services/document.service'
], function (moment, controllers) {
  'use strict';

  controllers.controller('DocumentCtrl', ['$scope', '$rootScope', 'config', '$log',
    function ($scope, $rootScope, config, $log) {
      $log.debug('Controller: DocumentCtrl');

      $scope.document.activity_date_time = $scope.document.activity_date_time ? moment($scope.document.activity_date_time).toDate() : null;
      $scope.document.expire_date = $scope.document.expire_date ? moment($scope.document.expire_date).toDate() : null;
      $scope.document.valid_from = $scope.document.valid_from ? moment($scope.document.valid_from).toDate() : null;
      $scope.document.remind_me = $scope.document.remind_me === 1;
      $scope.urlFile = config.url.FILE + '/zip?entityID=' + $scope.document.id + '&entityTable=civicrm_activity';

      $scope.$watch('document.activity_date_time', function (documentDateTime) {
        $scope.document.due = new Date(documentDateTime).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
      });
    }
  ]);
});
