define(['controllers/controllers',
        'moment',
        'services/keyDate',
        'services/contact'], function(controllers, moment){

    controllers.controller('DateListCtrl',['$scope', '$modal', '$rootElement', '$rootScope', '$route', '$filter',
        '$log', '$timeout', 'contactList','KeyDateService',
        function($scope, $modal, $rootElement, $rootScope, $route, $filter, $log, $timeout, contactList,KeyDateService){
            $log.debug('Controller: DateListCtrl');

            this.init = function(){

                $scope.dateList = this.createDateList(contactList);

                $rootScope.$broadcast('ct-spinner-hide');

                //Load year range in background
                KeyDateService.get(moment().startOf('year'),moment().endOf('year')).then(function(contactList){
                    $scope.dateList = this.createDateList(contactList);
                    $scope.dataLoading = false;
                }.bind(this));
            }


            // Create date list from contact list
            this.createDateList = function(contactList){
                var i = 0, len = contactList.length, date, dateObj = {}, dateList = [];
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

                return dateList;
            };

            $scope.dataLoading = true;
            $scope.dateList = [];
            $scope.dateListSelected = [];

            $scope.dpOpened = {
                filterDates: {}
            }

            $scope.isCollapsed = {
                filterDates: true
            };

            $scope.filterParams = {
                dateRange: {
                    from: new Date().setHours(0, 0, 0, 0),
                    until: moment().add(1, 'month').toDate().setHours(0, 0, 0, 0)
                },
                date: 'month',
                dateType: []
            };

            $scope.label = {
                isoWeek: 'Week',
                month: 'Month',
                year: 'Year',
                dateRange: ''
            };

            $scope.labelDateRange = function(from, until){
                var filterDateTimeFrom = $filter('date')(from, 'dd/MM/yyyy') || '',
                    filterDateTimeUntil = $filter('date')(until, 'dd/MM/yyyy') || '';

                if (filterDateTimeUntil) {
                    filterDateTimeUntil = !filterDateTimeFrom ? 'Until: ' + filterDateTimeUntil : ' - ' + filterDateTimeUntil;
                }

                if (filterDateTimeFrom) {
                    filterDateTimeFrom = !filterDateTimeUntil ? 'From: ' + filterDateTimeFrom : filterDateTimeFrom;
                }

                $scope.label.dateRange = filterDateTimeFrom + filterDateTimeUntil;
            }

            $scope.showDateRange = function(from, until){
                $scope.$broadcast('ct-spinner-show','dateList');
                KeyDateService.get(moment(from),moment(until)).then(function(contactList){
                        $scope.dateListSelected = this.createDateList(contactList);
                        $scope.filterParams.date = 'dateRange';
                        $scope.$broadcast('ct-spinner-hide','dateList');
                }.bind(this));
            }.bind(this);

            this.init();

        }]);
});