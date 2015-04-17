define(['angularSelect', 'textAngular', 'config', 'controllers/controllers', 'directives/directives',
    'filters/filters', 'services/services'], function(){
    var app = angular.module('civitasks.appDashboard',[
        'ngRoute',
        'ngResource',
        'ngSanitize',
        'ui.bootstrap',
        'ui.select',
        'textAngular',
        'civitasks.config',
        'civitasks.controllers',
        'civitasks.directives',
        'civitasks.filters',
        'civitasks.services'
    ]);

    app.config(['config','$routeProvider','$resourceProvider','$httpProvider','uiSelectConfig','$logProvider',
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
                    templateUrl: config.path.TPL+'dashboard/documents.html?v='+(new Date().getTime())
                }).
                when('/assignments', {
                    controller: 'AssignmentsCtrl',
                    templateUrl: config.path.TPL+'dashboard/assignments.html?v='+(new Date().getTime())
                }).
                when('/calendar', {
                    templateUrl: config.path.TPL+'dashboard/calendar.html?v='+(new Date().getTime())
                }).
                when('/reports', {
                    templateUrl: config.path.TPL+'dashboard/reports.html?v='+(new Date().getTime())
                }).
                when('/key-dates', {
                    templateUrl: config.path.TPL+'dashboard/key-dates.html?v='+(new Date().getTime())
                }).
                otherwise({redirectTo:'/tasks'});

            $resourceProvider.defaults.stripTrailingSlashes = false;

            $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

            uiSelectConfig.theme = 'bootstrap';
        }
    ]);

    app.run(['config', '$rootScope','$q', 'TaskService', 'AssignmentService', '$log',
        function(config, $rootScope, $q, TaskService, AssignmentService, $log){
            $log.debug('appDashboard.run');

            $rootScope.pathTpl = config.path.TPL;
            $rootScope.prefix = config.CLASS_NAME_PREFIX;
            $rootScope.cache = {
                contact: {
                    obj: {},
                    arr: [],
                    addSearch: []
                },
                assignmentType: {},
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

            AssignmentService.getTypes().then(function(types){
                angular.extend($rootScope.cache.assignmentType,types);
            });

        }
    ]);

    return app;
});