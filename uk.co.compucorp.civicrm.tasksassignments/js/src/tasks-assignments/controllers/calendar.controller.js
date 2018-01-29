/* eslint-env amd */

define([
  'common/angular',
  'common/moment'
], function (angular, moment) {
  'use strict';

  CalendarController.__name = 'CalendarController';
  CalendarController.$inject = [
    '$filter', '$log', '$rootScope', '$scope', '$timeout', '$state', '$stateParams',
    'settings', 'documentList', 'taskList'
  ];

  function CalendarController ($filter, $log, $rootScope, $scope, $timeout, $state,
    $stateParams, settings, documentList, taskList) {
    $scope.calendarDay = new Date();
    $scope.calendarTitle = '';
    $scope.calendarView = $state.params.calendarView || 'month';
    $scope.calTaskList = [];
    $scope.calDocList = [];

    this.createCalEventList = createCalEventList.bind(this);
    $scope.displayDayView = displayDayView;

    (function init () {
      initListeners.call(this);

      $scope.calTaskList = this.createCalEventList('task', taskList, $rootScope.cache.taskType.obj);

      if (!+settings.tabEnabled.documents) {
        return;
      }

      $scope.calDocList = this.createCalEventList('document', documentList, $rootScope.cache.documentType.obj);
    }.bind(this)());

    function createCalEventList (type, actvList, actvTypeObj) {
      var calActvList = [];

      angular.forEach(actvList, function (actv) {
        actv.activity_date_time = moment(actv.activity_date_time).toDate();

        this.push({
          id: actv.id,
          title: actvTypeObj[actv.activity_type_id],
          type: type,
          startsAt: actv.activity_date_time,
          endsAt: actv.activity_date_time,
          editable: false,
          deletable: false,
          incrementsBadgeTotal: true
        });

        if (actv.expire_date) {
          actv.expire_date = moment(actv.expire_date).toDate();

          if (+actv.expire_date !== +actv.activity_date_time) {
            this.push({
              id: actv.id,
              title: actvTypeObj[actv.activity_type_id],
              type: type,
              startsAt: actv.expire_date,
              endsAt: actv.expire_date,
              editable: false,
              deletable: false,
              incrementsBadgeTotal: true
            });
          }
        }
      }, calActvList);

      return calActvList;
    }

    function displayDayView (calendarDate) {
      $scope.calendarDay = moment(calendarDate).toDate();
      $scope.calendarView = 'day';
    }

    function eventUpdateCb (output, input, calActvList, activityTypeObj, type) {
      var actvOutDue;
      var actvOutTitle;
      var actvOutId = output.id;
      var actvOutExpDate;
      var actvInId = input.id;
      var len = calActvList.length;
      var i = 0;

      if (actvInId) {
        for (; i < len; i++) {
          if (+calActvList[i].id === +actvInId) {
            calActvList.splice(i, 1);
            i--;
            len--;
          }
        }
      }

      if (actvOutId) {
        actvOutDue = moment(output.activity_date_time).toDate();
        actvOutTitle = activityTypeObj[output.activity_type_id];

        calActvList.push({
          id: actvOutId,
          title: actvOutTitle,
          type: type,
          startsAt: actvOutDue,
          endsAt: actvOutDue,
          editable: false,
          deletable: false,
          incrementsBadgeTotal: true
        });

        if (output.expire_date) {
          actvOutExpDate = moment(output.expire_date).toDate();

          if (+actvOutExpDate !== +actvOutDue) {
            calActvList.push({
              id: actvOutId,
              title: actvOutTitle,
              type: type,
              startsAt: actvOutExpDate,
              endsAt: actvOutExpDate,
              editable: false,
              deletable: false,
              incrementsBadgeTotal: true
            });
          }
        }
      }
    }

    function initListeners () {
      $scope.$on('taskDelete', function (e, taskId) {
        eventUpdateCb({}, { id: taskId }, $scope.calTaskList);
      });

      $scope.$on('taskFormSuccess', function (e, output, input) {
        var isResolved = $rootScope.cache.taskStatusResolve.indexOf(output.status_id) > -1;
        eventUpdateCb(!isResolved ? output : {}, input, $scope.calTaskList, $rootScope.cache.taskType.obj, 'task');
      });

      $scope.$on('documentDelete', function (e, documentId) {
        eventUpdateCb({}, { id: documentId }, $scope.calDocList);
      });

      $scope.$on('documentFormSuccess', function (e, output, input) {
        var isResolved = $rootScope.cache.documentStatusResolve.indexOf(output.status_id) > -1;
        eventUpdateCb(!isResolved ? output : {}, input, $scope.calDocList, $rootScope.cache.documentType.obj, 'document');
      });

      $scope.$on('assignmentFormSuccess', function (e, output) {
        Array.prototype.push.apply(
          $scope.calTaskList,
          this.createCalEventList('task', output.taskList, $rootScope.cache.taskType.obj)
        );

        if (!+settings.tabEnabled.documents) {
          return;
        }

        Array.prototype.push.apply(
          $scope.calDocList,
          this.createCalEventList('document', output.documentList, $rootScope.cache.documentType.obj)
        );
      }.bind(this));
    }
  }

  return CalendarController;
});
