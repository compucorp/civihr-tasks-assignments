/* eslint-env amd */

define([
  'common/angular',
  'common/moment',
  'common/lodash'
], function (angular, moment, _) {
  'use strict';

  angular.module('tasks-assignments.dashboard.config', [
    'tasks-assignments.constants',
    'tasks-assignments.dashboard.constants'
  ]).config(dashboardConfig);

  dashboardConfig.$inject = [
    'config', '$resourceProvider', '$httpProvider', '$logProvider', '$urlRouterProvider',
    '$stateProvider', '$analyticsProvider', 'calendarConfigProvider', 'uibDatepickerConfig',
    'uiSelectConfig', 'dashboard.settings'
  ];

  /**
   * Configures Google Analytics via the angulartics provider
   *
   * @param {Object} $analyticsProvider
   */
  function configureAnalytics ($analyticsProvider) {
    $analyticsProvider.withAutoBase(true);
    $analyticsProvider.settings.ga = {
      userId: _.get(CRM, 'vars.session.contact_id')
    };
  }

  function dashboardConfig (config, $resourceProvider, $httpProvider, $logProvider,
    $urlRouterProvider, $stateProvider, $analyticsProvider, calendarConfigProvider,
    datepickerConfig, uiSelectConfig, dashboardSettings) {
    configureAnalytics($analyticsProvider);
    $logProvider.debugEnabled(config.DEBUG);
    $urlRouterProvider.otherwise('/tasks');

    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $resourceProvider.defaults.stripTrailingSlashes = false;
    datepickerConfig.showWeeks = false;
    uiSelectConfig.theme = 'bootstrap';

    calendarConfigProvider.setDateFormats({
      weekDay: 'ddd'
    });

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
        templateUrl: dashboardSettings.baseUrl + 'templates/tasks.html',
        resolve: {
          taskList: ['taskService', function (taskService) {
            return taskService.get({
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
        templateUrl: dashboardSettings.baseUrl + 'templates/documents.html',
        resolve: {
          documentList: ['documentService', function (documentService) {
            return documentService.get({});
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
        templateUrl: dashboardSettings.baseUrl + 'controllers/external-page.assignments.html'
      })
      .state('calendar', {
        abstract: true,
        controller: 'CalendarController',
        templateUrl: dashboardSettings.baseUrl + 'controllers/calendar.html',
        resolve: {
          documentList: ['$q', 'documentService', 'settings', function ($q, documentService, settings) {
            var deferred = $q.defer();

            if (!+settings.tabEnabled.documents) {
              deferred.resolve([]);
            }

            $q.all([
              documentService.get({
                'sequential': 0,
                'assignee_contact_id': config.LOGGED_IN_CONTACT_ID,
                'status_id': {
                  'NOT IN': config.status.resolve.DOCUMENT
                }
              }),
              documentService.get({
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
          taskList: ['$q', 'taskService', function ($q, taskService) {
            var deferred = $q.defer();

            $q.all([
              taskService.get({
                'sequential': 1,
                'assignee_contact_id': config.LOGGED_IN_CONTACT_ID,
                'status_id': { 'NOT IN': config.status.resolve.TASK }
              }),
              taskService.get({
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
            templateUrl: dashboardSettings.baseUrl + 'controllers/calendar.document-list.html'
          },
          'taskList': {
            controller: 'TaskListController',
            controllerAs: 'list',
            templateUrl: dashboardSettings.baseUrl + 'controllers/calendar.task-list.html'
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
        templateUrl: dashboardSettings.baseUrl + 'controllers/external-page.reports.html'
      })
      .state('keyDates', {
        url: '/key-dates',
        controller: 'DateListController',
        templateUrl: dashboardSettings.baseUrl + 'controllers/date-list.html',
        resolve: {
          contactList: ['keyDateService', function (keyDateService) {
            return keyDateService.get(moment().startOf('month'), moment().endOf('month'));
          }]
        }
      });
  }
});
