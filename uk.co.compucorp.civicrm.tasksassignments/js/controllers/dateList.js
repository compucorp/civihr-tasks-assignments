define(['controllers/controllers',
        'moment',
        'services/keyDate',
        'services/contact'], function(controllers, moment){

    controllers.controller('DateListCtrl',['$scope', '$modal', '$rootElement', '$rootScope', '$route', '$filter',
        '$log', 'contactList','KeyDateService',
        function($scope, $modal, $rootElement, $rootScope, $route, $filter, $log, contactList,KeyDateService){
            $log.debug('Controller: DateListCtrl');

            this.contactList = contactList;

            this.init = function(){

                this.createDateList();

                $rootScope.$broadcast('ct-spinner-hide');

                this.backgroundLoading();
            }

            this.backgroundLoading = function(){
                KeyDateService.get(moment().startOf('year'),moment().endOf('year')).then(function(contactList){
                    this.contactList = contactList;
                    this.createDateList();
                    $scope.dataLoading = false;
                }.bind(this));
            }

            this.createDateList = function(){
                var i = 0, contactList = this.contactList, len = contactList.length, date, dateObj = {}, dateList = [];
                for (; i < len; i++) {
                    dateObj[contactList[i].keydate] = dateObj[contactList[i].keydate] || [];
                    dateObj[contactList[i].keydate].push(contactList[i]);
                }

                for (date in dateObj) {
                    dateList.push({
                        date: date,
                        dateContactList: dateObj[date]
                    });
                }

                $scope.dateList = dateList;
            };

            $scope.dataLoading = true;
            $scope.dateList = [];

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