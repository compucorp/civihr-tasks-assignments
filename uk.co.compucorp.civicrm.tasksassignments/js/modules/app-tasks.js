define(['modules/run'], function () {
    'use strict';

    angular.module('civitasks.appTasks', ['civitasks.run'])
        .config(['config','$routeProvider','$resourceProvider','$httpProvider','datepickerConfig','uiSelectConfig',
            '$logProvider',
            function(config, $routeProvider, $resourceProvider, $httpProvider, datepickerConfig, uiSelectConfig,
                     $logProvider){
                $logProvider.debugEnabled(config.DEBUG);

                $routeProvider.
                    when('/', {
                        controller: 'TaskListCtrl',
                        templateUrl: config.path.TPL+'contact/tasks.html?v=222',
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
});
