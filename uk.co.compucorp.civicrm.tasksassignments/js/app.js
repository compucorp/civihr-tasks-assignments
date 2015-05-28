define(['moment', 'crmUi','angularBootstrapCalendar', 'angularSelect', 'textAngular', 'config', 'controllers/controllers', 'directives/directives',
    'filters/filters', 'services/services'], function(moment){

    angular.module('civitasks.run',[
        'ngRoute',
        'ngResource',
        'ngSanitize',
        'ui.bootstrap',
        'ui.select',
        'mwl.calendar',
        'textAngular',
        'crmUi',
        'civitasks.config',
        'civitasks.controllers',
        'civitasks.directives',
        'civitasks.filters',
        'civitasks.services'
    ]).run(['config', '$rootScope', '$rootElement', '$q', '$location', 'DocumentService',
        'TaskService', 'AssignmentService', 'KeyDateService', '$log',
        function(config, $rootScope, $rootElement, $q, $location, DocumentService, TaskService, AssignmentService,
                 KeyDateService, $log){
            $log.debug('civitasks.run');

            $rootScope.pathTpl = config.path.TPL;
            $rootScope.prefix = config.CLASS_NAME_PREFIX;
            $rootScope.url = config.url;
            $rootScope.location = $location;
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
                //TODO
                documentStatusResolve: ['3', '4'],
                taskType: {
                    obj: {},
                    arr: []
                },
                taskStatus: {
                    obj: {},
                    arr: []
                },
                //TODO
                taskStatusResolve: ['2', '3', '6', '8']
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

            angular.forEach($rootScope.cache.dateType.obj, function(value, key){
                this.push({
                    key: key,
                    value: value
                })
            },$rootScope.cache.dateType.arr);

            $rootScope.$on('$routeChangeSuccess', function() {
                $rootElement.removeClass('ct-page-loading');
            });

        }
    ]);

    angular.module('civitasks.appDashboard',['civitasks.run'])
        .config(['config','$routeProvider','$resourceProvider','$httpProvider','uiSelectConfig','$logProvider',
            function(config, $routeProvider, $resourceProvider, $httpProvider, uiSelectConfig, $logProvider){
                $logProvider.debugEnabled(config.debug);

                $routeProvider.
                    when('/tasks', {
                        controller: 'TaskListCtrl',
                        templateUrl: config.path.TPL+'dashboard/tasks.html?v='+(new Date().getTime()),
                        resolve: {
                            taskList: ['$q', 'TaskService',function($q, TaskService){
                                var deferred = $q.defer();

                                $q.all([
                                    TaskService.get({
                                        'sequential': 0,
                                        'assignee_contact_id': config.LOGGED_IN_CONTACT_ID
                                    }),
                                    TaskService.get({
                                        'sequential': 0,
                                        'source_contact_id': config.LOGGED_IN_CONTACT_ID
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
                    when('/documents', {
                        controller: 'DocumentListCtrl',
                        templateUrl: config.path.TPL+'dashboard/documents.html?v='+(new Date().getTime()),
                        resolve: {
                            documentList: ['$q', 'DocumentService',function($q, DocumentService){
                                var deferred = $q.defer();

                                $q.all([
                                    DocumentService.get({
                                        'sequential': 0,
                                        'assignee_contact_id': config.LOGGED_IN_CONTACT_ID
                                    }),
                                    DocumentService.get({
                                        'sequential': 0,
                                        'source_contact_id': config.LOGGED_IN_CONTACT_ID
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
                    when('/assignments', {
                        controller: 'ExternalPageCtrl',
                        templateUrl: config.path.TPL+'dashboard/assignments.html?v='+(new Date().getTime())
                    }).
                    when('/calendar', {
                        controller: 'CalendarCtrl',
                        templateUrl: config.path.TPL+'dashboard/calendar.html?v='+(new Date().getTime())
                    }).
                    when('/reports', {
                        controller: 'ExternalPageCtrl',
                        templateUrl: config.path.TPL+'dashboard/reports.html?v='+(new Date().getTime())
                    }).
                    when('/key-dates', {
                        controller: 'DateListCtrl',
                        templateUrl: config.path.TPL+'dashboard/key-dates.html?v='+(new Date().getTime()),
                        resolve: {
                            contactList: ['KeyDateService',function(KeyDateService){
                                return KeyDateService.get(moment().startOf('year'),moment().endOf('year'));
                            }]
                        }
                    }).
                    otherwise({redirectTo:'/tasks'});

                $resourceProvider.defaults.stripTrailingSlashes = false;

                $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

                uiSelectConfig.theme = 'bootstrap';
            }
        ]);

    angular.module('civitasks.appDocuments',['civitasks.run'])
        .config(['config','$routeProvider','$resourceProvider','$httpProvider','uiSelectConfig','$logProvider',
            function(config, $routeProvider, $resourceProvider, $httpProvider, uiSelectConfig, $logProvider){
                $logProvider.debugEnabled(config.debug);

                $routeProvider.
                    when('/', {
                        controller: 'DocumentListCtrl',
                        templateUrl: config.path.TPL+'contact/documents.html?v='+(new Date().getTime()),
                        resolve: {
                            documentList: ['DocumentService',function(DocumentService){
                                return DocumentService.get({
                                    'target_contact_id': config.CONTACT_ID
                                });
                            }]
                        }
                    }
                ).otherwise({redirectTo:'/'});

                $resourceProvider.defaults.stripTrailingSlashes = false;

                $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

                uiSelectConfig.theme = 'bootstrap';
            }
        ]);

    angular.module('civitasks.appTasks',['civitasks.run'])
        .config(['config','$routeProvider','$resourceProvider','$httpProvider','uiSelectConfig','$logProvider',
            function(config, $routeProvider, $resourceProvider, $httpProvider, uiSelectConfig, $logProvider){
                $logProvider.debugEnabled(config.debug);

                $routeProvider.
                    when('/', {
                        controller: 'TaskListCtrl',
                        templateUrl: config.path.TPL+'contact/tasks.html?v='+(new Date().getTime()),
                        resolve: {
                            taskList: ['TaskService',function(TaskService){
                                return TaskService.get({
                                    'target_contact_id': config.CONTACT_ID
                                });
                            }]
                        }
                    }
                ).otherwise({redirectTo:'/'});

                $resourceProvider.defaults.stripTrailingSlashes = false;

                $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

                uiSelectConfig.theme = 'bootstrap';
            }
        ]);

});