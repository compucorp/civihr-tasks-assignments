/* eslint-env amd */

define([
  'common/moment'
], function (moment) {
  'use strict';

  DocumentController.__name = 'DocumentController';
  DocumentController.$inject = ['$log', '$rootScope', '$scope', 'config'];

  function DocumentController ($log, $rootScope, $scope, config) {
    $log.debug('Controller: DocumentController');

    $scope.document.activity_date_time = $scope.document.activity_date_time ? moment($scope.document.activity_date_time).toDate() : null;
    $scope.document.expire_date = $scope.document.expire_date ? moment($scope.document.expire_date).toDate() : null;
    $scope.document.valid_from = $scope.document.valid_from ? moment($scope.document.valid_from).toDate() : null;
    $scope.document.remind_me = $scope.document.remind_me === 1;

    (function init () {
      initWatchers();
    }());

    /**
     * initializes the document watch functions.
     */
    function initWatchers () {
      $scope.$watch('document.activity_date_time', function (documentDateTime) {
        $scope.document.due = new Date(documentDateTime).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
      });
      $scope.$watch('document.id', function () {
        $scope.fileUrl = config.url.FILE + '/zip?entityID=' + $scope.document.id + '&entityTable=civicrm_activity';
      });
    }
  }

  return DocumentController;
});
