define([
    'tasks-assignments/modules/run'
], function () {
    'use strict';

    angular.module('civitasks.appDocuments', ['civitasks.run'])
        .config(['config', '$urlRouterProvider', '$stateProvider', '$resourceProvider', '$httpProvider', 'datepickerConfig', 'uiSelectConfig',
            '$logProvider',
            function (config, $urlRouterProvider, $stateProvider, $resourceProvider, $httpProvider, datepickerConfig, uiSelectConfig,
                      $logProvider) {
                $logProvider.debugEnabled(config.DEBUG);

                $urlRouterProvider.otherwise('/');

                $stateProvider
                    .state('main', {
                        url: '/',
                        controller: 'DocumentListCtrl',
                        templateUrl: config.path.TPL + 'contact/documents.html?v=4',
                        resolve: {
                            documentList: ['DocumentService', function (DocumentService) {
                                return DocumentService.get({
                                    'target_contact_id': config.CONTACT_ID,
                                    'status_id': {
                                        'NOT IN': config.status.resolve.DOCUMENT
                                    }
                                });
                            }]
                        }
                    });


                $resourceProvider.defaults.stripTrailingSlashes = false;

                $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

                datepickerConfig.showWeeks = false;

                uiSelectConfig.theme = 'bootstrap';
            }
        ]);
});
