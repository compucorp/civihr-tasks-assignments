/* eslint-env amd */

define([
  'tasks-assignments/directives/directives'
], function (directives) {
  'use strict';

  directives.directive('ctCiviEvents', ['$rootScope', '$log', function ($rootScope, $log) {
    $log.debug('Directive: ctCiviEvents');

    return {
      link: function ($scope) {
          // TODO
        CRM.$(document).on('crmFormSuccess', function (e, data) {
          $log.debug('crmFormSuccess');
          $log.debug(data);
          $scope.$broadcast('crmFormSuccess', data);
        });

          // TODO
        CRM.$(document).on('crmFormSubmit', function (e, data) {
          $log.debug('crmFormSubmit');
          $log.debug(data);
          $scope.$broadcast('crmFormSubmit', data);
        });

          // TODO
        CRM.$(document).on('crmFormCancel', function (e, data) {
          $log.debug('crmFormCancel');
          $log.debug(data);
          $scope.$broadcast('crmFormCancel', data);
        });
      }
    };
  }]);
});
