define(['crmUi','angularSelect', 'textAngular', 'config', 'controllers/controllers', 'directives/directives',
    'filters/filters', 'services/services'], function(){
    var app = angular.module('civitasks.appDocuments',[
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
                    controller: 'DocumentListCtrl',
                    templateUrl: config.path.TPL+'contact/documents.html?v='+(new Date().getTime()),
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
                }
            ).otherwise({redirectTo:'/'});

            $resourceProvider.defaults.stripTrailingSlashes = false;

            $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

            uiSelectConfig.theme = 'bootstrap';
        }
    ]);

    app.run(['config', '$rootScope','$q', 'DocumentService', 'AssignmentService', '$log',
        function(config, $rootScope, $q, DocumentService, AssignmentService, $log){
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
                documentType: {
                    obj: {},
                    arr: []
                },
                documentStatus: {
                    obj: {},
                    arr: []
                },
                //TODO
                documentStatusResolve: ['3', '4']
            };

            DocumentService.getOptions().then(function(options){
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