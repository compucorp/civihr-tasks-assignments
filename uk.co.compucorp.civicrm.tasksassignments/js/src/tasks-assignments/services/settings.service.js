/* eslint-env amd */

define(function () {
  'use strict';

  settingsService.__name = 'settingsService';
  settingsService.$inject = [
    'Settings', '$q', 'config', 'utilsService', '$log', 'settings'
  ];

  function settingsService (Settings, $q, config, utilsService, $log, settings) {
    $log.debug('Service: settingsService');

    return {
      get: function (fields) {
        var deferred = $q.defer();

        fields = fields && typeof fields === 'object' ? fields : [];

        Settings.get({
          'action': 'get',
          'json': {
            'sequential': 1,
            'debug': config.DEBUG,
            'fields': fields
          }
        }, function (data) {
          deferred.resolve(data.values);
        }, function () {
          deferred.reject('Unable to fetch tasks list');
        });

        return deferred.promise;
      },
      set: function (fields) {
        if (!fields || typeof fields !== 'object') {
          return null;
        }

        var deferred = $q.defer();

        Settings.save({
          'action': 'set',
          'json': {
            'sequential': 1,
            'debug': config.DEBUG,
            'fields': fields
          }
        }, null, function (data) {
          if (utilsService.errorHandler(data, 'Unable to save', deferred)) {
            return;
          }

          settings.tabEnabled = {
            documents: fields.documents_tab || settings.tabEnabled.documents_tab,
            keyDates: fields.keydates_tab || settings.tabEnabled.keydates_tab
          };

          settings.copy.button.assignmentAdd = fields.add_assignment_button_title;

          deferred.resolve(data.values);
        }, function () {
          deferred.reject('Unable to save');
        });

        return deferred.promise;
      }
    };
  }

  return settingsService;
});
