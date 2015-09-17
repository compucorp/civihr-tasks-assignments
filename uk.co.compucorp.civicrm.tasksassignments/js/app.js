define([
    'moment',
    'angularBootstrapCalendar',
    'angularChecklistModel',
    'angularRouter',
    'angularSelect',
    'angularXeditable',
    'angularXeditableCivi',
    'textAngular',
    'config',
    'settings',
    'controllers/controllers',
    'directives/directives',
    'filters/filters',
    'services/services'], function(moment){

    angular.module('civitasks.run',[
        'angularFileUpload',
        'ngRoute',
        'ngResource',
        'ngSanitize',
        'ui.bootstrap',
        'ui.router',
        'ui.select',
        'mwl.calendar',
        'textAngular',
        'checklist-model',
        'civitasks.config',
        'civitasks.controllers',
        'civitasks.directives',
        'civitasks.filters',
        'civitasks.services',
        'civitasks.settings',
        'xeditable',
        'xeditable-civi',
    ]).run(['config', 'settings', '$rootScope', '$rootElement', '$q', '$location', 'DocumentService',
        'TaskService', 'AssignmentService', 'KeyDateService', 'ContactService', 'editableOptions', '$log',
        function(config, settings, $rootScope, $rootElement, $q, $location, DocumentService, TaskService,
                 AssignmentService, KeyDateService, ContactService, editableOptions, $log){
            $log.debug('civitasks.run');

            $rootScope.pathTpl = config.path.TPL;
            $rootScope.permissions = config.permissions;
            $rootScope.prefix = config.CLASS_NAME_PREFIX;
            $rootScope.url = config.url;
            $rootScope.location = $location;
            $rootScope.settings = settings;
            $rootScope.cache = {
                contact: {
                    obj: {},
                    arr: [],
                    addSearch: []
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
                //TODO
                dateType: {
                    obj: {
                        period_start_date: 'Contract Start Date',
                        period_end_date: 'Contract End Date',
                        birth_date: 'Birthday',
                        initial_join_date: 'Initial Join Date',
                        final_termination_date: 'Final Termination Date',
                        probation_end_date: 'Probation End Date'
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

            TaskService.getOptions().then(function(options){
                angular.extend($rootScope.cache,options);
            });

            DocumentService.getOptions().then(function(options){
                angular.extend($rootScope.cache,options);
            });

            AssignmentService.getTypes().then(function(types){
                angular.extend($rootScope.cache.assignmentType.obj,types);
                angular.forEach(types, function(type) {
                    this.push(type);
                }, $rootScope.cache.assignmentType.arr);
            });

            ContactService.get({'IN': [config.LOGGED_IN_CONTACT_ID]}).then(function(data){
                ContactService.updateCache(data);
            });

            angular.forEach($rootScope.cache.dateType.obj, function(value, key){
                this.push({
                    key: key,
                    value: value
                })
            },$rootScope.cache.dateType.arr);

            $rootScope.$on('$stateChangeSuccess', function() {
                $rootElement.removeClass('ct-page-loading');
            });

            editableOptions.theme = 'bs3';

        }
    ]);

    angular.module('civitasks.appDashboard',['civitasks.run'])
        .config(['config', '$resourceProvider','$httpProvider', '$logProvider',
            '$urlRouterProvider', '$stateProvider','calendarConfigProvider', 'datepickerConfig', 'uiSelectConfig',
            function(config, $resourceProvider, $httpProvider, $logProvider,
                     $urlRouterProvider, $stateProvider, calendarConfigProvider, datepickerConfig, uiSelectConfig){
                $logProvider.debugEnabled(config.DEBUG);

                $urlRouterProvider.otherwise("/tasks");

                $stateProvider.
                    state('tasks', {
                        url: '/tasks',
                        controller: 'TaskListCtrl',
                        templateUrl: config.path.TPL+'dashboard/tasks.html?v='+(new Date().getTime()),
                        resolve: {
                            taskList: ['$q', 'TaskService',function($q, TaskService){
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
                                ]).then(function(results){
                                    var taskId, taskList = [];

                                    angular.extend(results[0],results[1]);

                                    for (taskId in results[0]) {
                                        taskList.push(results[0][taskId]);
                                    }

                                    deferred.resolve(taskList);

                                });

                                return deferred.promise;
                            }]
                        }
                    }).
                    state('tasks.my', {
                        url: '/my',
                        params: {
                            userRole: {
                                field: 'assignee_contact_id',
                                isEqual: true
                            }
                        }
                    }).
                    state('tasks.delegated', {
                        url: '/delegated',
                        params: {
                            userRole: {
                                field: 'assignee_contact_id',
                                isEqual: false
                            }
                        }
                    }).
                    state('tasks.all', {
                        url: '/all',
                        params: {
                            userRole: {
                                field: null,
                                isEqual: null
                            }
                        }
                    }).
                    state('documents', {
                        url: '/documents',
                        controller: 'DocumentListCtrl',
                        templateUrl: config.path.TPL+'dashboard/documents.html?v=8',
                        resolve: {
                            documentList: ['$q', 'DocumentService', function($q, DocumentService){
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
                                ]).then(function(results){
                                    var documentId, documentList = [];

                                    angular.extend(results[0],results[1]);

                                    for (documentId in results[0]) {
                                        documentList.push(results[0][documentId]);
                                    }

                                    deferred.resolve(documentList);

                                });

                                return deferred.promise;
                            }]
                        }
                    }).
                    state('documents.my', {
                        url: '/my',
                        params: {
                            userRole: {
                                field: 'assignee_contact_id',
                                isEqual: true
                            }
                        }
                    }).
                    state('documents.delegated', {
                        url: '/delegated',
                        params: {
                            userRole: {
                                field: 'assignee_contact_id',
                                isEqual: false
                            }
                        }
                    }).
                    state('documents.all', {
                        url: '/all',
                        params: {
                            userRole: {
                                field: null,
                                isEqual: null
                            }
                        }
                    }).
                    state('assignments', {
                        url: '/assignments',
                        controller: 'ExternalPageCtrl',
                        templateUrl: config.path.TPL+'dashboard/assignments.html?v=5'
                    }).
                    state('calendar', {
                        abstract: true,
                        controller: 'CalendarCtrl',
                        templateUrl: config.path.TPL+'dashboard/calendar.html?v=3',
                        resolve: {
                            documentList: ['$q', 'DocumentService','settings', function($q, DocumentService, settings){
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
                                ]).then(function(results){
                                    var documentId, documentList = [];

                                    angular.extend(results[0],results[1]);

                                    for (documentId in results[0]) {
                                        documentList.push(results[0][documentId]);
                                    }

                                    deferred.resolve(documentList);

                                });

                                return deferred.promise;
                            }],
                            taskList: ['$q', 'TaskService',function($q, TaskService){
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
                                ]).then(function(results){
                                    var taskId, taskList = [];

                                    angular.extend(results[0],results[1]);

                                    for (taskId in results[0]) {
                                        taskList.push(results[0][taskId]);
                                    }

                                    deferred.resolve(taskList);

                                });

                                return deferred.promise;
                            }]
                        }
                    }).
                    state('calendar.mwl', {
                        url: '/calendar',
                        views: {
                            'documentList': {
                                controller: 'DocumentListCtrl',
                                templateUrl: config.path.TPL+'dashboard/calendar.documentList.html?v=6'
                            },
                            'taskList': {
                                controller: 'TaskListCtrl',
                                templateUrl: config.path.TPL+'dashboard/calendar.taskList.html?v=4'
                            }
                        }
                    }).
                    state('calendar.mwl.day', {
                        params: {
                            calendarView: 'day'
                        }
                    }).
                    state('calendar.mwl.month', {
                        params: {
                            calendarView: 'month'
                        }
                    }).
                    state('calendar.mwl.week', {
                        params: {
                            calendarView: 'week'
                        }
                    }).
                    state('reports', {
                        url: '/reports',
                        controller: 'ExternalPageCtrl',
                        templateUrl: config.path.TPL+'dashboard/reports.html?v=4'
                    }).
                    state('keyDates', {
                        url: '/key-dates',
                        controller: 'DateListCtrl',
                        templateUrl: config.path.TPL+'dashboard/key-dates.html?v=4',
                        resolve: {
                            contactList: ['KeyDateService',function(KeyDateService){
                                return KeyDateService.get(moment().startOf('month'),moment().endOf('month'));
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

    angular.module('civitasks.appDocuments',['civitasks.run'])
        .config(['config','$routeProvider','$resourceProvider','$httpProvider','datepickerConfig','uiSelectConfig',
            '$logProvider',
            function(config, $routeProvider, $resourceProvider, $httpProvider, datepickerConfig, uiSelectConfig,
                     $logProvider){
                $logProvider.debugEnabled(config.DEBUG);

                $routeProvider.
                    when('/', {
                        controller: 'DocumentListCtrl',
                        templateUrl: config.path.TPL+'contact/documents.html?v=4',
                        resolve: {
                            documentList: ['DocumentService',function(DocumentService){
                                return DocumentService.get({
                                    'target_contact_id': config.CONTACT_ID,
                                    'status_id': {
                                        'NOT IN': config.status.resolve.DOCUMENT
                                    }
                                });
                            }]
                        }
                    }
                ).otherwise({redirectTo:'/'});

                $resourceProvider.defaults.stripTrailingSlashes = false;

                $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

                datepickerConfig.showWeeks = false;

                uiSelectConfig.theme = 'bootstrap';
            }
        ]);

    angular.module('civitasks.appTasks',['civitasks.run'])
        .config(['config','$routeProvider','$resourceProvider','$httpProvider','datepickerConfig','uiSelectConfig',
            '$logProvider',
            function(config, $routeProvider, $resourceProvider, $httpProvider, datepickerConfig, uiSelectConfig,
                     $logProvider){
                $logProvider.debugEnabled(config.DEBUG);

                $routeProvider.
                    when('/', {
                        controller: 'TaskListCtrl',
                        templateUrl: config.path.TPL+'contact/tasks.html?v=123',
                        resolve: {
                            taskList: ['TaskService',function(TaskService){
                                return TaskService.get({
                                    'target_contact_id': config.CONTACT_ID,
                                    'status_id': {
                                        'NOT IN': config.status.resolve.TASK
                                    }
                                });
                            }]
                        }
                    }
                ).otherwise({redirectTo:'/'});

                $resourceProvider.defaults.stripTrailingSlashes = false;

                $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

                datepickerConfig.showWeeks = false;

                uiSelectConfig.theme = 'bootstrap';
            }
        ]);

    angular.module('civitasks.appSettings',['civitasks.run'])
        .config(['config','$stateProvider','$urlRouterProvider', '$resourceProvider', '$urlRouterProvider',
            '$httpProvider','datepickerConfig', 'uiSelectConfig','$logProvider',
            function(config, $stateProvider, $urlRouterProvider, $resourceProvider, $urlRouterProvider, $httpProvider,
                datepickerConfig, uiSelectConfig, $logProvider){
                $logProvider.debugEnabled(config.DEBUG);

                $urlRouterProvider.otherwise("/");

                $stateProvider.
                    state('settings', {
                        url: '/',
                        controller: 'SettingsCtrl',
                        templateUrl: config.path.TPL+'settings.html?v=5'
                    }
                );

                $resourceProvider.defaults.stripTrailingSlashes = false;

                $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

                datepickerConfig.showWeeks = false;

                uiSelectConfig.theme = 'bootstrap';
            }
        ]);

});