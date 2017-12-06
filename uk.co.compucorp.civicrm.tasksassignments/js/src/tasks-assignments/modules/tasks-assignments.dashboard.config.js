/* eslint-env amd */

define([
  'common/angular',
  'common/moment',
  'common/lodash'
], function (angular, moment, _) {
  'use strict';

  angular.module('tasks-assignments.dashboard.config', ['tasks-assignments.constants']).config(dashboardConfig);

  dashboardConfig.$inject = [
    'config', '$resourceProvider', '$httpProvider', '$logProvider', '$urlRouterProvider',
    '$stateProvider', 'calendarConfigProvider', 'uibDatepickerConfig', 'uiSelectConfig'
  ];

  function dashboardConfig (config, $resourceProvider, $httpProvider, $logProvider,
    $urlRouterProvider, $stateProvider, calendarConfigProvider, datepickerConfig,
    uiSelectConfig) {
    $logProvider.debugEnabled(config.DEBUG);

    $urlRouterProvider.otherwise('/tasks');

    $stateProvider
      .resolveForAll({
        format: ['DateFormat', function (DateFormat) {
          return DateFormat.getDateFormat();
        }]
      })
      .state('tasks', {
        url: '/tasks',
        controller: 'TaskListController',
        controllerAs: 'list',
        templateUrl: config.path.TPL + 'dashboard/tasks.html?v=' + (new Date().getTime()),
        resolve: {
          taskList: ['TaskService', function (TaskService) {
            return TaskService.get({
              'status_id': { 'NOT IN': config.status.resolve.TASK }
            });
          }]
        }
      })
      .state('tasks.my', {
        url: '/my',
        params: { ownership: 'assigned' }
      })
      .state('tasks.delegated', {
        url: '/delegated',
        params: { ownership: 'delegated' }
      })
      .state('tasks.all', {
        url: '/all',
        params: { ownership: null }
      })
      .state('documents', {
        url: '/documents',
        controller: 'DocumentListController',
        controllerAs: 'list',
        templateUrl: config.path.TPL + 'dashboard/documents.html?v=8',
        resolve: {
          documentList: ['DocumentService', function (DocumentService) {
            return DocumentService.get({});
          }]
        }
      })
      .state('documents.my', {
        url: '/my',
        params: { ownership: 'assigned' }
      })
      .state('documents.delegated', {
        url: '/delegated',
        params: { ownership: 'delegated' }
      })
      .state('documents.all', {
        url: '/all',
        params: { ownership: null }
      })
      .state('assignments', {
        url: '/assignments',
        controller: 'ExternalPageController',
        templateUrl: config.path.TPL + 'dashboard/assignments.html?v=5'
      })
      .state('calendar', {
        abstract: true,
        controller: 'CalendarController',
        templateUrl: config.path.TPL + 'dashboard/calendar.html?v=3',
        resolve: {
          documentList: ['$q', 'DocumentService', 'settings', function ($q, DocumentService, settings) {
            var deferred = $q.defer();

            if (!+settings.tabEnabled.documents) {
              deferred.resolve([]);
            }

            $q.all([
              DocumentService.get({
                'sequential': 0,
                'assignee_contact_id': config.LOGGED_IN_CONTACT_ID,
                'status_id': {
                  'NOT IN': config.status.resolve.DOCUMENT
                }
              }),
              DocumentService.get({
                'sequential': 0,
                'source_contact_id': config.LOGGED_IN_CONTACT_ID,
                'status_id': {
                  'NOT IN': config.status.resolve.DOCUMENT
                }
              })
            ]).then(function (results) {
              var documentId;
              var documentList = [];

              angular.extend(results[0], results[1]);

              for (documentId in results[0]) {
                documentList.push(results[0][documentId]);
              }

              deferred.resolve(documentList);
            });

            return deferred.promise;
          }],
          taskList: ['$q', 'TaskService', function ($q, TaskService) {
            var deferred = $q.defer();

            $q.all([
              TaskService.get({
                'sequential': 1,
                'assignee_contact_id': config.LOGGED_IN_CONTACT_ID,
                'status_id': { 'NOT IN': config.status.resolve.TASK }
              }),
              TaskService.get({
                'sequential': 1,
                'source_contact_id': config.LOGGED_IN_CONTACT_ID,
                'status_id': { 'NOT IN': config.status.resolve.TASK }
              })
            ]).then(function (results) {
              var mergedResults = _(results[0]).assign(results[1]);
              deferred.resolve(mergedResults.values().value());
            });

            return deferred.promise;
          }]
        }
      })
      .state('calendar.mwl', {
        url: '/calendar',
        views: {
          'documentList': {
            controller: 'DocumentListController',
            controllerAs: 'list',
            templateUrl: config.path.TPL + 'dashboard/calendar.documentList.html?v=6'
          },
          'taskList': {
            controller: 'TaskListController',
            controllerAs: 'list',
            templateUrl: config.path.TPL + 'dashboard/calendar.taskList.html?v=5'
          }
        }
      })
      .state('calendar.mwl.day', {
        params: {
          calendarView: 'day'
        }
      })
      .state('calendar.mwl.month', {
        params: {
          calendarView: 'month'
        }
      })
      .state('calendar.mwl.week', {
        params: {
          calendarView: 'week'
        }
      })
      .state('reports', {
        url: '/reports',
        controller: 'ExternalPageController',
        templateUrl: config.path.TPL + 'dashboard/reports.html?v=4'
      })
      .state('keyDates', {
        url: '/key-dates',
        controller: 'DateListController',
        templateUrl: config.path.TPL + 'dashboard/key-dates.html?v=4',
        resolve: {
          contactList: ['KeyDateService', function (KeyDateService) {
            return KeyDateService.get(moment().startOf('month'), moment().endOf('month'));
          }]
        }
      });

    $resourceProvider.defaults.stripTrailingSlashes = false;

    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

    calendarConfigProvider.setDateFormats({
      weekDay: 'ddd'
    });

    datepickerConfig.showWeeks = false;

    uiSelectConfig.theme = 'bootstrap';
  }
});
