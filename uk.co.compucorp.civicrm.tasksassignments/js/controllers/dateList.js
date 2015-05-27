define(['controllers/controllers',
        'moment',
        'services/keyDate',
        'services/contact'], function(controllers, moment){

    controllers.controller('DateListCtrl',['$scope', '$modal', '$rootElement', '$rootScope', '$route', '$filter',
        '$log', 'contactList', 'config', 'ContactService',
        function($scope, $modal, $rootElement, $rootScope, $route, $filter, $log, contactList, config, ContactService){
            $log.debug('Controller: DateListCtrl');

            this.contactList = contactList;

            this.init = function(){

                $scope.dateList = this.createDateList();

                $rootScope.$broadcast('ct-spinner-hide');
                console.log($rootScope.cache);
            }

            this.createDateList = function(){
                var i = 0, contactList = this.contactList, len = contactList.length, date, dateObj = {}, dateList = [];
                for (; i < len; i++) {
                    dateObj[contactList[i].keydate] = dateObj[contactList[i].keydate] || [];
                    dateObj[contactList[i].keydate].push(contactList[i]);
                }

                console.log(dateObj);

                for (date in dateObj) {
                    dateList.push({
                        date: date,
                        dateContactList: dateObj[date]
                    });
                }

                console.log(dateList);
                return dateList;
            };

            $scope.dateList = {};

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
                date: 'month',
                dateType: []
            };

            $scope.filterParamsHolder = {
                dateRange: {
                    from: new Date().setHours(0, 0, 0, 0),
                    until: moment().add(1, 'month').toDate().setHours(0, 0, 0, 0)
                }
            }

            $scope.label = {
                isoWeek: 'Week',
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