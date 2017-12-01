define([
    'common/moment',
    'tasks-assignments/controllers/controllers',
    'tasks-assignments/services/key-date.service',
    'tasks-assignments/services/contact.service'
], function (moment, controllers) {
    'use strict';

    controllers.controller('DateListCtrl', ['$scope', '$uibModal', '$rootElement', '$rootScope', '$filter',
        '$log', '$timeout', 'contactList', 'KeyDateService', 'config',
        function ($scope, $modal, $rootElement, $rootScope, $filter, $log, $timeout, contactList, KeyDateService,
                  config) {
            $log.debug('Controller: DateListCtrl');

            this.init = function () {
                $scope.dateList = this.createDateList(contactList);

                $rootScope.$broadcast('ct-spinner-hide');

                //Load year range in background
                KeyDateService.get(moment().startOf('year'), moment().endOf('year')).then(function (contactList) {
                    $scope.dateList = this.createDateList(contactList);
                    $scope.dataLoading = false;
                }.bind(this));

                watchDateFilters();
            };

            // Create date list from contact list
            this.createDateList = function (contactList) {
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
            $scope.dateListLimit = 5;
            $scope.dateListSelected = [];

            $scope.dpOpened = {
                filterDates: {}
            };

            $scope.isCollapsed = {
                filterDates: true
            };

            $scope.filterParams = {
                dateRange: {
                    from: moment().startOf('day').toDate(),
                    until: moment().add(1, 'month').startOf('day').toDate()
                },
                date: 'month',
                dateType: []
            };

            $scope.datepickerOptions = {
                from: { maxDate: $scope.filterParams.dateRange.until },
                until: { minDate: $scope.filterParams.dateRange.from }
            };

            $scope.label = {
                isoWeek: 'Week',
                month: 'Month',
                year: 'Year',
                dateRange: ''
            };

            $scope.csvExport = function () {
                var startDate, endDate;

                if ($scope.filterParams.date == 'dateRange') {

                    startDate = $scope.filterParams.dateRange.from ?
                        moment($scope.filterParams.dateRange.from).format('YYYY-MM-DD') :
                        '';
                    endDate = $scope.filterParams.dateRange.until ?
                        moment($scope.filterParams.dateRange.until).format('YYYY-MM-DD') :
                        '';

                } else {
                    startDate = moment().startOf($scope.filterParams.date).format('YYYY-MM-DD');
                    endDate = moment().endOf($scope.filterParams.date).format('YYYY-MM-DD');
                }

                window.location.href = config.url.CSV_EXPORT + '/keydatescsv?start_date=' + startDate + '&end_date=' + endDate;
            };

            $scope.labelDateRange = function (from, until) {
                var filterDateTimeFrom = $filter('date')(from, 'dd/MM/yyyy') || '',
                    filterDateTimeUntil = $filter('date')(until, 'dd/MM/yyyy') || '';

                if (filterDateTimeUntil) {
                    filterDateTimeUntil = !filterDateTimeFrom ? 'Until: ' + filterDateTimeUntil : ' - ' + filterDateTimeUntil;
                }

                if (filterDateTimeFrom) {
                    filterDateTimeFrom = !filterDateTimeUntil ? 'From: ' + filterDateTimeFrom : filterDateTimeFrom;
                }

                $scope.label.dateRange = filterDateTimeFrom + filterDateTimeUntil;
            };

            $scope.showDateRange = function (from, until) {
                $scope.$broadcast('ct-spinner-show', 'dateList');

                KeyDateService.get(moment(from), moment(until)).then(function (contactList) {
                    $scope.dateListSelected = this.createDateList(contactList);
                    $scope.filterParams.date = 'dateRange';
                    $scope.$broadcast('ct-spinner-hide', 'dateList');
                }.bind(this));
            }.bind(this);

            this.init();

            /**
             * Whenever the date filters will change, their corrispondent
             * datepickers will have the minDate or maxDate setting updated
             * accordingly
             */
            function watchDateFilters() {
              $scope.$watch('filterParams.dateRange.from', function (newValue) {
                $scope.datepickerOptions.until.minDate = newValue;
              });

              $scope.$watch('filterParams.dateRange.until', function (newValue) {
                $scope.datepickerOptions.from.maxDate = newValue;
              });
            }
        }]);
});
