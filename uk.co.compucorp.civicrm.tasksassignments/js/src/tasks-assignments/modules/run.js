define([
    'common/angular',
    'common/modules/xeditable-civi',
    'tasks-assignments/vendor/angular-bootstrap-calendar',
    'tasks-assignments/vendor/angular-checklist-model',
    'tasks-assignments/vendor/angular-router',
    'tasks-assignments/vendor/angular-select',
    'tasks-assignments/modules/config',
    'tasks-assignments/modules/settings',
    'common/modules/routers/compu-ui-router',
    'common/filters/angular-date/format-date',
    'common/directives/angular-date/date-input'
], function (angular) {
    'use strict';

    angular.module('civitasks.run', [
        'angularFileUpload',
        'ngResource',
        'ngSanitize',
        'compu.ui.router',
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
        'common.angularDate'
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
            }, $rootScope.cache.dateType.arr);

            $rootScope.$on('$stateChangeSuccess', function() {
                $rootElement.removeClass('ct-page-loading');
            });

            editableOptions.theme = 'bs3';

        }
    ]);
});
