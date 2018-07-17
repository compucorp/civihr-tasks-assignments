/* eslint-env amd */

define([
  'common/angular'
], function (angular) {
  'use strict';

  angular.module('tasks-assignments.run', [
    'tasks-assignments.constants',
    'tasks-assignments.values'
  ]).run(run);

  run.$inject = [
    '$rootScope', '$rootElement', '$q', '$location', '$log', 'config', 'settings',
    'documentService', 'taskService', 'assignmentService', 'keyDateService',
    'contactService', 'editableOptions'
  ];

  function run ($rootScope, $rootElement, $q, $location, $log, config, settings,
    documentService, taskService, assignmentService, keyDateService, contactService,
    editableOptions) {
    $log.debug('tasks-assignments.run');

    var contactsToCache = [config.LOGGED_IN_CONTACT_ID];

    $rootScope.cache = {
      contact: {
        obj: {},
        arr: [],
        arrSearch: []
      },
      assignment: {
        obj: {},
        arr: [],
        arrSearch: []
      },
      assignmentType: {
        obj: {},
        arr: []
      },
      // TODO
      dateType: {
        obj: {
          period_start_date: 'Contract Start Date',
          period_end_date: 'Contract End Date',
          birth_date: 'Birthday'
        },
        arr: []
      },
      documentType: {
        obj: {},
        arr: []
      },
      documentStatus: {
        obj: {},
        arr: []
      },
      documentStatusResolve: config.status.resolve.DOCUMENT,
      taskType: {
        obj: {},
        arr: []
      },
      taskStatus: {
        obj: {},
        arr: []
      },
      taskStatusResolve: config.status.resolve.TASK
    };
    $rootScope.location = $location;
    $rootScope.pathTpl = config.path.TPL;
    $rootScope.permissions = config.permissions;
    $rootScope.prefix = config.CLASS_NAME_PREFIX;
    $rootScope.settings = settings;
    $rootScope.url = config.url;

    config.CONTACT_ID && contactsToCache.push(config.CONTACT_ID);

    taskService.getOptions().then(function (options) {
      angular.extend($rootScope.cache, options);
    });

    documentService.getOptions().then(function (options) {
      angular.extend($rootScope.cache, options);
    });

    assignmentService.getTypes().then(function (types) {
      angular.extend($rootScope.cache.assignmentType.obj, types);
      angular.forEach(types, function (type) {
        this.push(type);
      }, $rootScope.cache.assignmentType.arr);
    });

    contactService.get({ 'IN': contactsToCache }).then(function (data) {
      contactService.updateCache(data);
    });

    angular.forEach($rootScope.cache.dateType.obj, function (value, key) {
      this.push({
        key: key,
        value: value
      });
    }, $rootScope.cache.dateType.arr);

    $rootScope.$on('$stateChangeSuccess', function () {
      $rootElement.removeClass('ct-page-loading');
    });

    editableOptions.theme = 'bs3';
  }
});
