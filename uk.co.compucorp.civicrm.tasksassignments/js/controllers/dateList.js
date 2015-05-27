define(['controllers/controllers',
        'services/keyDate',
        'services/contact'], function(controllers){

    controllers.controller('DateListCtrl',['$scope', '$modal', '$rootElement', '$rootScope', '$route', '$filter',
        '$log', 'dateList', 'config', 'ContactService',
        function($scope, $modal, $rootElement, $rootScope, $route, $filter, $log, dateList, config, ContactService){
            $log.debug('Controller: DateListCtrl');

            console.log(dateList);

            this.init = function(){
                $rootScope.$broadcast('ct-spinner-hide');
                console.log($rootScope.cache);
            }

            $scope.dateList = dateList;

            $scope.dpOpened = {
                filterDates: {}
            }

            $scope.isCollapsed = {
                filterDates: true
            };

            $scope.filterParams = {
                dateRange: {
                    from: null,
                    until: null
                },
                date: null,
                dateType: []
            };

            $scope.filterParamsHolder = {
                dateRange: {
                    from: new Date().setHours(0, 0, 0, 0),
                    until: moment().add(1, 'month').toDate().setHours(0, 0, 0, 0)
                }
            }

            $scope.label = {
                week: 'Week',
                month: 'Month',
                year: 'Year',
                dateRange: ''
            };

            $scope.labelDateRange = function(){
                var filterDateTimeFrom = $filter('date')($scope.filterParams.dateRange.from, 'dd/MM/yyyy') || '',
                    filterDateTimeUntil = $filter('date')($scope.filterParams.dateRange.until, 'dd/MM/yyyy') || '';

                if (filterDateTimeUntil) {
                    filterDateTimeUntil = !filterDateTimeFrom ? 'Until: ' + filterDateTimeUntil : ' - ' + filterDateTimeUntil;
                }

                if (filterDateTimeFrom) {
                    filterDateTimeFrom = !filterDateTimeUntil ? 'From: ' + filterDateTimeFrom : filterDateTimeFrom;
                }

                $scope.label.dateRange = filterDateTimeFrom + filterDateTimeUntil;
            }

            this.init();

        }]);
});