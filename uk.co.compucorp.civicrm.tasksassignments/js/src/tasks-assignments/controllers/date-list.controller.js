/* eslint-env amd */

define([
  'common/moment'
], function (moment) {
  'use strict';

  DateListController.__name = 'DateListController';
  DateListController.$inject = [
    '$filter', '$log', '$rootElement', '$rootScope', '$scope', '$timeout',
    '$uibModal', 'keyDateService', 'config', 'contactList'
  ];

  function DateListController ($filter, $log, $rootElement, $rootScope, $scope, $timeout,
    $modal, keyDateService, config, contactList) {
    $log.debug('Controller: DateListController');

    $scope.dataLoading = true;
    $scope.dateList = [];
    $scope.dateListLimit = 5;
    $scope.dateListSelected = [];
    $scope.dpOpened = {
      filterDates: {}
    };
    $scope.filterParams = {
      date: 'month',
      dateType: [],
      dateRange: {
        from: moment().startOf('day').toDate(),
        until: moment().add(1, 'month').startOf('day').toDate()
      }
    };
    $scope.datepickerOptions = {
      from: { maxDate: $scope.filterParams.dateRange.until },
      until: { minDate: $scope.filterParams.dateRange.from }
    };
    $scope.isCollapsed = {
      filterDates: true
    };
    $scope.label = {
      isoWeek: 'Week',
      month: 'Month',
      year: 'Year',
      dateRange: ''
    };

    this.createDateList = createDateList.bind(this);
    $scope.csvExport = csvExport;
    $scope.labelDateRange = labelDateRange;
    $scope.showDateRange = showDateRange.bind(this);

    (function init () {
      $scope.dateList = this.createDateList(contactList);

      $rootScope.$broadcast('ct-spinner-hide');

      // Load year range in background
      keyDateService.get(moment().startOf('year'), moment().endOf('year')).then(function (contactList) {
        $scope.dateList = this.createDateList(contactList);
        $scope.dataLoading = false;
      }.bind(this));

      initWatchers();
    }.bind(this)());

    // Create date list from contact list
    function createDateList (contactList) {
      var i = 0;
      var len = contactList.length;
      var date;
      var dateObj = {};
      var dateList = [];

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
    }

    function csvExport () {
      var startDate, endDate;

      if ($scope.filterParams.date === 'dateRange') {
        startDate = $scope.filterParams.dateRange.from
        ? moment($scope.filterParams.dateRange.from).format('YYYY-MM-DD')
        : '';
        endDate = $scope.filterParams.dateRange.until
        ? moment($scope.filterParams.dateRange.until).format('YYYY-MM-DD')
        : '';
      } else {
        startDate = moment().startOf($scope.filterParams.date).format('YYYY-MM-DD');
        endDate = moment().endOf($scope.filterParams.date).format('YYYY-MM-DD');
      }

      window.location.href = config.url.CSV_EXPORT + '/keydatescsv?start_date=' + startDate + '&end_date=' + endDate;
    }

    /**
     * Whenever the date filters will change, their corrispondent
     * datepickers will have the minDate or maxDate setting updated
     * accordingly
     */
    function initWatchers () {
      $scope.$watch('filterParams.dateRange.from', function (newValue) {
        $scope.datepickerOptions.until.minDate = newValue;
      });

      $scope.$watch('filterParams.dateRange.until', function (newValue) {
        $scope.datepickerOptions.from.maxDate = newValue;
      });
    }

    function labelDateRange (from, until) {
      var filterDateTimeFrom = $filter('date')(from, 'dd/MM/yyyy') || '';
      var filterDateTimeUntil = $filter('date')(until, 'dd/MM/yyyy') || '';

      if (filterDateTimeUntil) {
        filterDateTimeUntil = !filterDateTimeFrom ? 'Until: ' + filterDateTimeUntil : ' - ' + filterDateTimeUntil;
      }

      if (filterDateTimeFrom) {
        filterDateTimeFrom = !filterDateTimeUntil ? 'From: ' + filterDateTimeFrom : filterDateTimeFrom;
      }

      $scope.label.dateRange = filterDateTimeFrom + filterDateTimeUntil;
    }

    function showDateRange (from, until) {
      $scope.$broadcast('ct-spinner-show', 'dateList');

      keyDateService.get(moment(from), moment(until)).then(function (contactList) {
        $scope.dateListSelected = this.createDateList(contactList);
        $scope.filterParams.date = 'dateRange';
        $scope.$broadcast('ct-spinner-hide', 'dateList');
      }.bind(this));
    }
  }

  return DateListController;
});
