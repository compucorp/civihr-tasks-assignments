/* eslint-env amd, jasmine */

define([
  'common/angularMocks',
  'tasks-assignments/modules/tasks-assignments.dashboard.module'
], function () {
  'use strict';

  describe('Due filter', function () {
    var $filter, today, pastDateRange, futureDateRange, mockDueDate, mockPlusTwoDays, mockPlusThreeDays,
      mockMinusTwoDays, mockMinusThreeDays, emptyDateRange, emptyFromDateAndUntilDateInTheFuture,
      emptyFromDateAndUntilDateInPast, emptyFromDateAndUntilDateIsToday, emptyUntilDateAndFromDateInThePast,
      emptyUntilDateAndFromDateIsToday, emptyUntilDateAndFromDateInTheFuture;

    var oneDay = 86400000;

    beforeEach(module('tasks-assignments.dashboard'));
    beforeEach(inject(function (_$filter_) {
      $filter = _$filter_;
      today = new Date();

      pastDateRange = {
        from: new Date(today.getTime() - oneDay * 2),
        until: new Date(today.getTime() - oneDay)
      };

      futureDateRange = {
        from: new Date(today.getTime() + oneDay),
        until: new Date(today.getTime() + oneDay * 2)
      };

      emptyDateRange = {
        from: null,
        until: null
      };

      emptyFromDateAndUntilDateInTheFuture = {
        from: null,
        until: new Date(today.getTime() + oneDay * 2)
      };

      emptyFromDateAndUntilDateInPast = {
        from: null,
        until: new Date(today.getTime() - oneDay * 2)
      };

      emptyFromDateAndUntilDateIsToday = {
        from: null,
        until: today
      };

      emptyUntilDateAndFromDateInThePast = {
        from: new Date(today.getTime() - oneDay * 2),
        until: null
      };

      emptyUntilDateAndFromDateIsToday = {
        from: today,
        until: null
      };

      emptyUntilDateAndFromDateInTheFuture = {
        from: new Date(today.getTime() + oneDay * 2),
        until: null
      };
    }));

    describe('filtering documents by due date', function () {
      describe('due date is in the future', function () {
        beforeEach(function () {
          mockDueDate = [{
            activity_date_time: new Date(today.getTime() + oneDay)
          }];

          mockPlusTwoDays = [{
            activity_date_time: new Date(today.getTime() + oneDay * 2)
          }];

          mockPlusThreeDays = [{
            activity_date_time: new Date(today.getTime() + oneDay * 3)
          }];
        });

        it('hides the result for "overdue"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'overdue', 'activity_date_time').length).toBe(0);
        });

        it('hides the result for "dueToday"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dueToday', 'activity_date_time').length).toBe(0);
        });

        it('shows the result for "dueThisWeek"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dueThisWeek', 'activity_date_time').length).toBe(1);
        });

        it('shows the result for "dueInNextFortnight"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dueInNextFortnight', 'activity_date_time').length).toBe(1);
        });

        it('shows the result for "dueInNinetyDays"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dueInNinetyDays', 'activity_date_time').length).toBe(1);
        });

        it('shows the result for "dateRange" in the future', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', futureDateRange).length).toBe(1);
        });

        it('hides the result for "dateRange" in the past', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', pastDateRange).length).toBe(0);
        });

        it('shows the result for "dateRange" if from and until dates are empty', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyDateRange).length).toBe(1);
        });

        it('shows the result for "dateRange" if from date is empty and until date is in the future but less than due date', function () {
          expect($filter('filterByDateField')(mockPlusThreeDays, 'dateRange', 'activity_date_time', emptyFromDateAndUntilDateInTheFuture).length).toBe(0);
        });

        it('shows the result for "dateRange" if from date is empty and until date is in the future but equals due date', function () {
          expect($filter('filterByDateField')(mockPlusTwoDays, 'dateRange', 'activity_date_time', emptyFromDateAndUntilDateInTheFuture).length).toBe(1);
        });

        it('shows the result for "dateRange" if from date is empty and until date is in the future but bigger than due date', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyFromDateAndUntilDateInTheFuture).length).toBe(1);
        });

        it('shows the result for "dateRange" if from date is empty and until date is in the past', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyFromDateAndUntilDateInPast).length).toBe(0);
        });

        it('shows the result for "dateRange" if from date is empty and until date is today', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyFromDateAndUntilDateIsToday).length).toBe(0);
        });

        it('shows the result for "dateRange" if until date is empty and from date is in the past', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyUntilDateAndFromDateInThePast).length).toBe(1);
        });

        it('shows the result for "dateRange" if until date is empty and from date is today', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyUntilDateAndFromDateIsToday).length).toBe(1);
        });

        it('shows the result for "dateRange" if until date is empty and from date is in the future but less than due date', function () {
          expect($filter('filterByDateField')(mockPlusThreeDays, 'dateRange', 'activity_date_time', emptyUntilDateAndFromDateInTheFuture).length).toBe(1);
        });

        it('shows the result for "dateRange" if until date is empty and from date is in the future but equals due date', function () {
          expect($filter('filterByDateField')(mockPlusTwoDays, 'dateRange', 'activity_date_time', emptyUntilDateAndFromDateInTheFuture).length).toBe(1);
        });

        it('shows the result for "dateRange" if until date is empty and from date is in the future but bigger than due date', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyUntilDateAndFromDateInTheFuture).length).toBe(0);
        });
      });

      describe('due date is in the past', function () {
        beforeEach(function () {
          mockDueDate = [{
            activity_date_time: new Date(today.getTime() - oneDay)
          }];

          mockMinusTwoDays = [{
            activity_date_time: new Date(today.getTime() - oneDay * 2)
          }];

          mockMinusThreeDays = [{
            activity_date_time: new Date(today.getTime() - oneDay * 3)
          }];
        });

        it('shows the result for "overdue"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'overdue', 'activity_date_time').length).toBe(1);
        });

        it('hides the result for "dueToday"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dueToday', 'activity_date_time').length).toBe(0);
        });

        it('hides the result for "dueThisWeek"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dueThisWeek', 'activity_date_time').length).toBe(0);
        });

        it('shows the result for "dueInNextFortnight"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dueInNextFortnight', 'activity_date_time').length).toBe(0);
        });

        it('shows the result for "dueInNinetyDays"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dueInNinetyDays', 'activity_date_time').length).toBe(0);
        });

        it('hides the result for "dateRange" in the future', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', futureDateRange).length).toBe(0);
        });

        it('shows the result for "dateRange" in the past', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', pastDateRange).length).toBe(1);
        });

        it('shows the result for "dateRange" if from and until dates are empty', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyDateRange).length).toBe(1);
        });

        it('shows the result for "dateRange" if from date is empty and until date is in the past but less than due date', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyFromDateAndUntilDateInPast).length).toBe(0);
        });

        it('shows the result for "dateRange" if from date is empty and until date is in the past but equals due date', function () {
          expect($filter('filterByDateField')(mockMinusTwoDays, 'dateRange', 'activity_date_time', emptyFromDateAndUntilDateInPast).length).toBe(1);
        });

        it('shows the result for "dateRange" if from date is empty and until date is in the past but bigger than due date', function () {
          expect($filter('filterByDateField')(mockMinusThreeDays, 'dateRange', 'activity_date_time', emptyFromDateAndUntilDateInPast).length).toBe(1);
        });

        it('shows the result for "dateRange" if from date is empty and until date is today', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyFromDateAndUntilDateIsToday).length).toBe(1);
        });

        it('shows the result for "dateRange" if from date is empty and until date is in the future', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyFromDateAndUntilDateInTheFuture).length).toBe(1);
        });

        it('shows the result for "dateRange" if until date is empty and from date is in the past but less than due date', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyUntilDateAndFromDateInThePast).length).toBe(1);
        });

        it('shows the result for "dateRange" if until date is empty and from date is in the past but equals due date', function () {
          expect($filter('filterByDateField')(mockMinusTwoDays, 'dateRange', 'activity_date_time', emptyUntilDateAndFromDateInThePast).length).toBe(1);
        });

        it('shows the result for "dateRange" if until date is empty and from date is in the past but bigger than due date', function () {
          expect($filter('filterByDateField')(mockMinusThreeDays, 'dateRange', 'activity_date_time', emptyUntilDateAndFromDateInThePast).length).toBe(0);
        });

        it('shows the result for "dateRange" if until date is empty and from date is today', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyUntilDateAndFromDateIsToday).length).toBe(0);
        });

        it('shows the result for "dateRange" if until date is empty and from date is in the future', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyUntilDateAndFromDateInTheFuture).length).toBe(0);
        });
      });

      describe('due date is today', function () {
        beforeEach(function () {
          mockDueDate = [{
            activity_date_time: today
          }];
        });

        it('hides the result for "overdue"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'overdue', 'activity_date_time').length).toBe(0);
        });

        it('shows the result for "dueToday"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dueToday', 'activity_date_time').length).toBe(1);
        });

        it('hides the result for "dueThisWeek"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dueThisWeek', 'activity_date_time').length).toBe(0);
        });

        it('shows the result for "dueInNextFortnight"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dueInNextFortnight', 'activity_date_time').length).toBe(1);
        });

        it('shows the result for "dueInNinetyDays"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dueInNinetyDays', 'activity_date_time').length).toBe(1);
        });

        it('hides the result for "dateRange" in the future', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', futureDateRange).length).toBe(0);
        });

        it('hides the result for "dateRange" in the past', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', pastDateRange).length).toBe(0);
        });

        it('shows the result for "dateRange" if from and until dates are empty', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyDateRange).length).toBe(1);
        });

        it('shows the result for "dateRange" if from date is empty and until date is in the past', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyFromDateAndUntilDateInPast).length).toBe(0);
        });

        it('shows the result for "dateRange" if from date is empty and until date is today', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyFromDateAndUntilDateIsToday).length).toBe(1);
        });

        it('shows the result for "dateRange" if from date is empty and until date is in the future', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyFromDateAndUntilDateInTheFuture).length).toBe(1);
        });

        it('shows the result for "dateRange" if until date is empty and from date is in the past', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyUntilDateAndFromDateInThePast).length).toBe(1);
        });

        it('shows the result for "dateRange" if until date is empty and from date is today', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyUntilDateAndFromDateIsToday).length).toBe(1);
        });

        it('shows the result for "dateRange" if until date is empty and from date is in the future', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyUntilDateAndFromDateInTheFuture).length).toBe(0);
        });
      });

      describe('due date is empty', function () {
        beforeEach(function () {
          mockDueDate = [{
            activity_date_time: null
          }];
        });

        it('hides the result for "overdue"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'overdue', 'activity_date_time').length).toBe(0);
        });

        it('hides the result for "dueToday"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dueToday', 'activity_date_time').length).toBe(0);
        });

        it('hides the result for "dueThisWeek"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dueThisWeek', 'activity_date_time').length).toBe(0);
        });

        it('hides the result for "dueInNextFortnight"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dueInNextFortnight', 'activity_date_time').length).toBe(0);
        });

        it('hides the result for "dueInNinetyDays"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dueInNinetyDays', 'activity_date_time').length).toBe(0);
        });

        it('hides the result for "dateRange" in the future', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', futureDateRange).length).toBe(0);
        });

        it('hides the result for "dateRange" in the past', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', pastDateRange).length).toBe(0);
        });

        it('shows the result for "dateRange" if from and until dates are empty', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyDateRange).length).toBe(1);
        });

        it('shows the result for "dateRange" if from date is empty and until date is in the past', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyFromDateAndUntilDateInPast).length).toBe(0);
        });

        it('shows the result for "dateRange" if from date is empty and until date is today', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyFromDateAndUntilDateIsToday).length).toBe(0);
        });

        it('shows the result for "dateRange" if from date is empty and until date is in the future', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyFromDateAndUntilDateInTheFuture).length).toBe(0);
        });

        it('shows the result for "dateRange" if until date is empty and from date is in the past', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyUntilDateAndFromDateInThePast).length).toBe(1);
        });

        it('shows the result for "dateRange" if until date is empty and from date is today', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyUntilDateAndFromDateIsToday).length).toBe(1);
        });

        it('shows the result for "dateRange" if until date is empty and from date is in the future', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'activity_date_time', emptyUntilDateAndFromDateInTheFuture).length).toBe(1);
        });
      });

      describe('test dueInNextFortnight', function () {
        it('show the result if date is after 13 days', function () {
          mockDueDate = [{
            activity_date_time: new Date(today.setDate(today.getDate() + 13))
          }];
          expect($filter('filterByDateField')(mockDueDate, 'dueInNextFortnight', 'activity_date_time').length).toBe(1);
        });

        it('show the result if date is after 14 days', function () {
          mockDueDate = [{
            activity_date_time: new Date(today.setDate(today.getDate() + 14))
          }];
          expect($filter('filterByDateField')(mockDueDate, 'dueInNextFortnight', 'activity_date_time').length).toBe(1);
        });

        it('hide the result if date is after 15 days', function () {
          mockDueDate = [{
            activity_date_time: new Date(today.setDate(today.getDate() + 15))
          }];
          expect($filter('filterByDateField')(mockDueDate, 'dueInNextFortnight', 'activity_date_time').length).toBe(0);
        });
      });

      describe('test dueInNinetyDays', function () {
        it('show the result if date is after 89 days', function () {
          mockDueDate = [{
            activity_date_time: new Date(today.setDate(today.getDate() + 89))
          }];
          expect($filter('filterByDateField')(mockDueDate, 'dueInNinetyDays', 'activity_date_time').length).toBe(1);
        });

        it('show the result if date is after 90 days', function () {
          mockDueDate = [{
            activity_date_time: new Date(today.setDate(today.getDate() + 90))
          }];
          expect($filter('filterByDateField')(mockDueDate, 'dueInNinetyDays', 'activity_date_time').length).toBe(1);
        });

        it('hide the result if date is after 91 days', function () {
          mockDueDate = [{
            activity_date_time: new Date(today.setDate(today.getDate() + 91))
          }];
          expect($filter('filterByDateField')(mockDueDate, 'dueInNinetyDays', 'activity_date_time').length).toBe(0);
        });
      });
    });

    describe('filtering documents by expiry date', function () {
      describe('due date is in the future', function () {
        beforeEach(function () {
          mockDueDate = [{
            expire_date: new Date(today.getTime() + oneDay)
          }];

          mockPlusTwoDays = [{
            expire_date: new Date(today.getTime() + oneDay * 2)
          }];

          mockPlusThreeDays = [{
            expire_date: new Date(today.getTime() + oneDay * 3)
          }];
        });

        it('hides the result for "overdue"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'overdue', 'expire_date').length).toBe(0);
        });

        it('shows the result for "dueInNextFortnight"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dueInNextFortnight', 'expire_date').length).toBe(1);
        });

        it('shows the result for "dueInNinetyDays"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dueInNinetyDays', 'expire_date').length).toBe(1);
        });

        it('shows the result for "dateRange" in the future', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', futureDateRange).length).toBe(1);
        });

        it('hides the result for "dateRange" in the past', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', pastDateRange).length).toBe(0);
        });

        it('shows the result for "dateRange" if from and until dates are empty', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyDateRange).length).toBe(1);
        });

        it('hides the result for "dateRange" if from date is empty and until date is in the future but less than due date', function () {
          expect($filter('filterByDateField')(mockPlusThreeDays, 'dateRange', 'expire_date', emptyFromDateAndUntilDateInTheFuture).length).toBe(0);
        });

        it('shows the result for "dateRange" if from date is empty and until date is in the future but equals due date', function () {
          expect($filter('filterByDateField')(mockPlusTwoDays, 'dateRange', 'expire_date', emptyFromDateAndUntilDateInTheFuture).length).toBe(1);
        });

        it('shows the result for "dateRange" if from date is empty and until date is in the future but bigger than due date', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyFromDateAndUntilDateInTheFuture).length).toBe(1);
        });

        it('hides the result for "dateRange" if from date is empty and until date is in the past', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyFromDateAndUntilDateInPast).length).toBe(0);
        });

        it('hides the result for "dateRange" if from date is empty and until date is today', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyFromDateAndUntilDateIsToday).length).toBe(0);
        });

        it('shows the result for "dateRange" if until date is empty and from date is in the past', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyUntilDateAndFromDateInThePast).length).toBe(1);
        });

        it('shows the result for "dateRange" if until date is empty and from date is today', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyUntilDateAndFromDateIsToday).length).toBe(1);
        });

        it('shows the result for "dateRange" if until date is empty and from date is in the future but less than due date', function () {
          expect($filter('filterByDateField')(mockPlusThreeDays, 'dateRange', 'expire_date', emptyUntilDateAndFromDateInTheFuture).length).toBe(1);
        });

        it('shows the result for "dateRange" if until date is empty and from date is in the future but equals due date', function () {
          expect($filter('filterByDateField')(mockPlusTwoDays, 'dateRange', 'expire_date', emptyUntilDateAndFromDateInTheFuture).length).toBe(1);
        });

        it('hides the result for "dateRange" if until date is empty and from date is in the future but bigger than due date', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyUntilDateAndFromDateInTheFuture).length).toBe(0);
        });
      });

      describe('due date is in the past', function () {
        beforeEach(function () {
          mockDueDate = [{
            expire_date: new Date(today.getTime() - oneDay)
          }];

          mockMinusTwoDays = [{
            expire_date: new Date(today.getTime() - oneDay * 2)
          }];

          mockMinusThreeDays = [{
            expire_date: new Date(today.getTime() - oneDay * 3)
          }];
        });

        it('shows the result for "overdue"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'overdue', 'expire_date').length).toBe(1);
        });

        it('hides the result for "dueInNextFortnight"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dueInNextFortnight', 'expire_date').length).toBe(0);
        });

        it('hides the result for "dueInNinetyDays"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dueInNinetyDays', 'expire_date').length).toBe(0);
        });

        it('hides the result for "dateRange" in the future', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', futureDateRange).length).toBe(0);
        });

        it('shows the result for "dateRange" in the past', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', pastDateRange).length).toBe(1);
        });

        it('shows the result for "dateRange" if from and until dates are empty', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyDateRange).length).toBe(1);
        });

        it('hides the result for "dateRange" if from date is empty and until date is in the past but less than due date', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyFromDateAndUntilDateInPast).length).toBe(0);
        });

        it('shows the result for "dateRange" if from date is empty and until date is in the past but equals due date', function () {
          expect($filter('filterByDateField')(mockMinusTwoDays, 'dateRange', 'expire_date', emptyFromDateAndUntilDateInPast).length).toBe(1);
        });

        it('shows the result for "dateRange" if from date is empty and until date is in the past but bigger than due date', function () {
          expect($filter('filterByDateField')(mockMinusThreeDays, 'dateRange', 'expire_date', emptyFromDateAndUntilDateInPast).length).toBe(1);
        });

        it('shows the result for "dateRange" if from date is empty and until date is today', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyFromDateAndUntilDateIsToday).length).toBe(1);
        });

        it('shows the result for "dateRange" if from date is empty and until date is in the future', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyFromDateAndUntilDateInTheFuture).length).toBe(1);
        });

        it('shows the result for "dateRange" if until date is empty and from date is in the past but less than due date', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyUntilDateAndFromDateInThePast).length).toBe(1);
        });

        it('shows the result for "dateRange" if until date is empty and from date is in the past but equals due date', function () {
          expect($filter('filterByDateField')(mockMinusTwoDays, 'dateRange', 'expire_date', emptyUntilDateAndFromDateInThePast).length).toBe(1);
        });

        it('hides the result for "dateRange" if until date is empty and from date is in the past but bigger than due date', function () {
          expect($filter('filterByDateField')(mockMinusThreeDays, 'dateRange', 'expire_date', emptyUntilDateAndFromDateInThePast).length).toBe(0);
        });

        it('hides the result for "dateRange" if until date is empty and from date is today', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyUntilDateAndFromDateIsToday).length).toBe(0);
        });

        it('hides the result for "dateRange" if until date is empty and from date is in the future', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyUntilDateAndFromDateInTheFuture).length).toBe(0);
        });
      });

      describe('due date is today', function () {
        beforeEach(function () {
          mockDueDate = [{
            expire_date: today
          }];
        });

        it('hides the result for "overdue"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'overdue', 'expire_date').length).toBe(0);
        });

        it('shows the result for "dueInNextFortnight"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dueInNextFortnight', 'expire_date').length).toBe(1);
        });

        it('shows the result for "dueInNinetyDays"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dueInNinetyDays', 'expire_date').length).toBe(1);
        });

        it('hides the result for "dateRange" in the future', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', futureDateRange).length).toBe(0);
        });

        it('hides the result for "dateRange" in the past', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', pastDateRange).length).toBe(0);
        });

        it('shows the result for "dateRange" if from and until dates are empty', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyDateRange).length).toBe(1);
        });

        it('hides the result for "dateRange" if from date is empty and until date is in the past', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyFromDateAndUntilDateInPast).length).toBe(0);
        });

        it('shows the result for "dateRange" if from date is empty and until date is today', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyFromDateAndUntilDateIsToday).length).toBe(1);
        });

        it('shows the result for "dateRange" if from date is empty and until date is in the future', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyFromDateAndUntilDateInTheFuture).length).toBe(1);
        });

        it('shows the result for "dateRange" if until date is empty and from date is in the past', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyUntilDateAndFromDateInThePast).length).toBe(1);
        });

        it('shows the result for "dateRange" if until date is empty and from date is today', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyUntilDateAndFromDateIsToday).length).toBe(1);
        });

        it('hides the result for "dateRange" if until date is empty and from date is in the future', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyUntilDateAndFromDateInTheFuture).length).toBe(0);
        });
      });

      describe('due date is empty', function () {
        beforeEach(function () {
          mockDueDate = [{
            expire_date: null
          }];
        });

        it('hides the result for "overdue"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'overdue', 'expire_date').length).toBe(0);
        });

        it('hides the result for "dueInNextFortnight"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dueInNextFortnight', 'expire_date').length).toBe(0);
        });

        it('hides the result for "dueInNinetyDays"', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dueInNinetyDays', 'expire_date').length).toBe(0);
        });

        it('hides the result for "dateRange" in the future', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', futureDateRange).length).toBe(0);
        });

        it('hides the result for "dateRange" in the past', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', pastDateRange).length).toBe(0);
        });

        it('shows the result for "dateRange" if from and until dates are empty', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyDateRange).length).toBe(1);
        });

        it('hides the result for "dateRange" if from date is empty and until date is in the past', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyFromDateAndUntilDateInPast).length).toBe(0);
        });

        it('hides the result for "dateRange" if from date is empty and until date is today', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyFromDateAndUntilDateIsToday).length).toBe(0);
        });

        it('hides the result for "dateRange" if from date is empty and until date is in the future', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyFromDateAndUntilDateInTheFuture).length).toBe(0);
        });

        it('shows the result for "dateRange" if until date is empty and from date is in the past', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyUntilDateAndFromDateInThePast).length).toBe(1);
        });

        it('shows the result for "dateRange" if until date is empty and from date is today', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyUntilDateAndFromDateIsToday).length).toBe(1);
        });

        it('shows the result for "dateRange" if until date is empty and from date is in the future', function () {
          expect($filter('filterByDateField')(mockDueDate, 'dateRange', 'expire_date', emptyUntilDateAndFromDateInTheFuture).length).toBe(1);
        });
      });

      describe('test dueInNextFortnight', function () {
        it('shows the result if date is after 13 days', function () {
          mockDueDate = [{
            expire_date: new Date(today.setDate(today.getDate() + 13))
          }];
          expect($filter('filterByDateField')(mockDueDate, 'dueInNextFortnight', 'expire_date').length).toBe(1);
        });

        it('shows the result if date is after 14 days', function () {
          mockDueDate = [{
            expire_date: new Date(today.setDate(today.getDate() + 14))
          }];
          expect($filter('filterByDateField')(mockDueDate, 'dueInNextFortnight', 'expire_date').length).toBe(1);
        });

        it('hide the result if date is after 15 days', function () {
          mockDueDate = [{
            expire_date: new Date(today.setDate(today.getDate() + 15))
          }];
          expect($filter('filterByDateField')(mockDueDate, 'dueInNextFortnight', 'expire_date').length).toBe(0);
        });
      });

      describe('test dueInNinetyDays', function () {
        it('shows the result if date is after 89 days', function () {
          mockDueDate = [{
            expire_date: new Date(today.setDate(today.getDate() + 89))
          }];
          expect($filter('filterByDateField')(mockDueDate, 'dueInNinetyDays', 'expire_date').length).toBe(1);
        });

        it('shows the result if date is after 90 days', function () {
          mockDueDate = [{
            expire_date: new Date(today.setDate(today.getDate() + 90))
          }];
          expect($filter('filterByDateField')(mockDueDate, 'dueInNinetyDays', 'expire_date').length).toBe(1);
        });

        it('hide the result if date is after 91 days', function () {
          mockDueDate = [{
            expire_date: new Date(today.setDate(today.getDate() + 91))
          }];
          expect($filter('filterByDateField')(mockDueDate, 'dueInNinetyDays', 'expire_date').length).toBe(0);
        });
      });
    });
  });
});
