define(['crmUi','angularSelect', 'textAngular', 'config', 'controllers/controllers', 'directives/directives',
    'filters/filters', 'services/services'], function(){
    var app = angular.module('civitasks.appContact',[
        'ngRoute',
        'ngResource',
        'ngSanitize',
        'ui.bootstrap',
        'ui.select',
        'textAngular',
        'crmUi',
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

    app.run(['config', '$rootScope','$q', 'TaskService', 'AssignmentService', '$log',
        function(config, $rootScope, $q, TaskService, AssignmentService, $log){
            $log.debug('appContact.run');

            $rootScope.pathTpl = config.path.TPL;
            $rootScope.prefix = config.CLASS_NAME_PREFIX;
            $rootScope.url = config.url;
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
                angular.extend($rootScope.cache.assignmentType.obj,types);
                angular.forEach(types, function(type) {
                    this.push(type);
                }, $rootScope.cache.assignmentType.arr);
            });

        }
    ]);

    return app;
});