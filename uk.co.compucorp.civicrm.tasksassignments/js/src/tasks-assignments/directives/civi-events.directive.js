/* eslint-env amd */

define(function () {
  'use strict';

  ctCiviEvents.$inject = ['$log', '$rootScope'];

  function ctCiviEvents ($log, $rootScope) {
    $log.debug('Directive: ctCiviEvents');

    return {
      link: link
    };

    function link ($scope) {
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
  }

  return { ctCiviEvents: ctCiviEvents };
});
