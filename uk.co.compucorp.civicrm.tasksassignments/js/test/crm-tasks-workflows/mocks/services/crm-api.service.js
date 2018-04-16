/* global angular */

(function () {
  angular.module('crm-tasks-workflows.mocks').factory('crmApi', function ($q) {
    var crmApi = function (entity, action, params, message) {
      var deferred = $q.defer();
      deferred.resolve();

      return deferred.promise;
    };

    return crmApi;
  });
})();
