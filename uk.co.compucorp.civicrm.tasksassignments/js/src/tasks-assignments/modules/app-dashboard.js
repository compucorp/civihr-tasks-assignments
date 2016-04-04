define([
    'common/angular',
    'common/moment',
    'common/services/angular-date/date-format',
    'tasks-assignments/modules/run'
], function (angular, moment) {
    'use strict';

    angular.module('civitasks.appDashboard', ['civitasks.run'])
        .config(['config', '$resourceProvider', '$httpProvider', '$logProvider',
            '$urlRouterProvider', '$stateProvider', 'calendarConfigProvider', 'datepickerConfig', 'uiSelectConfig',
            function (config, $resourceProvider, $httpProvider, $logProvider,
                      $urlRouterProvider, $stateProvider, calendarConfigProvider, datepickerConfig, uiSelectConfig) {
                $logProvider.debugEnabled(config.DEBUG);

                $urlRouterProvider.otherwise("/tasks");

                $stateProvider
                    .resolveForAll({
                        format: ['DateFormat', function (DateFormat) {
                            return DateFormat.getDateFormat();
                        }]
                    })
                    .state('tasks', {
                        url: '/tasks',
                        controller: 'TaskListCtrl',
                        templateUrl: config.path.TPL + 'dashboard/tasks.html?v=' + (new Date().getTime()),
                        resolve: {
                            taskList: ['$q', 'TaskService', function ($q, TaskService) {
                                var deferred = $q.defer();

                                $q.all([
                                    TaskService.get({
                                        'sequential': 0,
                                        'assignee_contact_id': config.LOGGED_IN_CONTACT_ID,
                                        'status_id': {
                                            'NOT IN': config.status.resolve.TASK
                                        }
                                    }),
                                    TaskService.get({
                                        'sequential': 0,
                                        'source_contact_id': config.LOGGED_IN_CONTACT_ID,
                                        'status_id': {
                                            'NOT IN': config.status.resolve.TASK
                                        }
                                    })
                                ]).then(function (results) {
                                    var taskId, taskList = [];

                                    angular.extend(results[0], results[1]);

                                    for (taskId in results[0]) {
                                        taskList.push(results[0][taskId]);
                                    }

                                    deferred.resolve(taskList);
                                });

                                return deferred.promise;
                            }]
                        }
                    })
                    .state('tasks.my', {
                        url: '/my',
                        params: {
                            userRole: {
                                field: 'assignee_contact_id',
                                isEqual: true
                            }
                        }
                    })
                    .state('tasks.delegated', {
                        url: '/delegated',
                        params: {
                            userRole: {
                                field: 'assignee_contact_id',
                                isEqual: false
                            }
                        }
                    })
                    .state('tasks.all', {
                        url: '/all',
                        params: {
                            userRole: {
                                field: null,
                                isEqual: null
                            }
                        }
                    })
                    .state('documents', {
                        url: '/documents',
                        controller: 'DocumentListCtrl',
                        templateUrl: config.path.TPL + 'dashboard/documents.html?v=8',
                        resolve: {
                            documentList: ['$q', 'DocumentService', function ($q, DocumentService) {
                                var deferred = $q.defer();

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
                                    var documentId, documentList = [];

                                    angular.extend(results[0], results[1]);

                                    for (documentId in results[0]) {
                                        documentList.push(results[0][documentId]);
                                    }

                                    deferred.resolve(documentList);

                                });

                                return deferred.promise;
                            }]
                        }
                    })
                    .state('documents.my', {
                        url: '/my',
                        params: {
                            userRole: {
                                field: 'assignee_contact_id',
                                isEqual: true
                            }
                        }
                    })
                    .state('documents.delegated', {
                        url: '/delegated',
                        params: {
                            userRole: {
                                field: 'assignee_contact_id',
                                isEqual: false
                            }
                        }
                    })
                    .state('documents.all', {
                        url: '/all',
                        params: {
                            userRole: {
                                field: null,
                                isEqual: null
                            }
                        }
                    })
                    .state('assignments', {
                        url: '/assignments',
                        controller: 'AssignmentsCtrl',
                        templateUrl: config.path.TPL + 'dashboard/assignments.html?v=5'
                    })
                    .state('calendar', {
                        abstract: true,
                        controller: 'CalendarCtrl',
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
                                    var documentId, documentList = [];

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
                                        'sequential': 0,
                                        'assignee_contact_id': config.LOGGED_IN_CONTACT_ID,
                                        'status_id': {
                                            'NOT IN': config.status.resolve.TASK
                                        }
                                    }),
                                    TaskService.get({
                                        'sequential': 0,
                                        'source_contact_id': config.LOGGED_IN_CONTACT_ID,
                                        'status_id': {
                                            'NOT IN': config.status.resolve.TASK
                                        }
                                    })
                                ]).then(function (results) {
                                    var taskId, taskList = [];

                                    angular.extend(results[0], results[1]);

                                    for (taskId in results[0]) {
                                        taskList.push(results[0][taskId]);
                                    }

                                    deferred.resolve(taskList);

                                });

                                return deferred.promise;
                            }]
                        }
                    })
                    .state('calendar.mwl', {
                        url: '/calendar',
                        views: {
                            'documentList': {
                                controller: 'DocumentListCtrl',
                                templateUrl: config.path.TPL + 'dashboard/calendar.documentList.html?v=6'
                            },
                            'taskList': {
                                controller: 'TaskListCtrl',
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
                        controller: 'ExternalPageCtrl',
                        templateUrl: config.path.TPL + 'dashboard/reports.html?v=4'
                    })
                    .state('keyDates', {
                        url: '/key-dates',
                        controller: 'DateListCtrl',
                        templateUrl: config.path.TPL + 'dashboard/key-dates.html?v=4',
                        resolve: {
                            contactList: ['KeyDateService', function (KeyDateService) {
                                return KeyDateService.get(moment().startOf('month'), moment().endOf('month'));
                            }]
                        }
                    });

                $resourceProvider.defaults.stripTrailingSlashes = false;

                $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

                calendarConfigProvider.setDateFormats({
                    weekDay: 'ddd'
                });

                datepickerConfig.showWeeks = false;

                uiSelectConfig.theme = 'bootstrap';
            }
        ]);
});
