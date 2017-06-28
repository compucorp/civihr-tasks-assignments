/* eslint angular/di: 0, jasmine/no-spec-dupes:0 */

define([
  'common/angularMocks',
  'tasks-assignments/app'
], function () {
  'use strict';

  describe('Due filter', function () {
    var $filter, today, pastDateRange, futureDateRange,
      emptyDateRange, emptyFromDateAndUntilDateInTheFuture, emptyFromDateAndUntilDateInPast,
      emptyFromDateAndUntilDateIsToday, emptyUntilDateAndFromDateInThePast,
      emptyUntilDateAndFromDateIsToday,emptyUntilDateAndFromDateInTheFuture;

    var oneDay = 86400000;

    beforeEach(module('civitasks.appDashboard'));
    beforeEach(inject(function (_$filter_) {
      $filter = _$filter_;
      today = new Date();

      var mockDueDate, mockPlusTwoDays, mockPlusThreeDays,
        mockMinusTwoDays, mockMinusThreeDays;

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

    describe('due date is in the future', function() {
      beforeEach(function() {
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

      it('hides the result for "overdue"', function() {
        expect($filter('filterByDue')(mockDueDate, 'overdue').length).toBe(0);
      });

      it('hides the result for "dueToday"', function() {
        expect($filter('filterByDue')(mockDueDate, 'dueToday').length).toBe(0);
      });

      it('shows the result for "dueThisWeek"', function() {
        expect($filter('filterByDue')(mockDueDate, 'dueThisWeek').length).toBe(1);
      });

      it('shows the result for "dueInNextFortnight"', function() {
        expect($filter('filterByDue')(mockDueDate, 'dueInNextFortnight').length).toBe(1);
      });

      it('shows the result for "dueInNinetyDays"', function() {
        expect($filter('filterByDue')(mockDueDate, 'dueInNinetyDays').length).toBe(1);
      });

      it('shows the result for "dateRange" in the future', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', futureDateRange).length).toBe(1);
      });

      it('hides the result for "dateRange" in the past', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', pastDateRange).length).toBe(0);
      });

      it('shows the result for "dateRange" if from and until dates are empty', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyDateRange).length).toBe(1);
      });

      it('shows the result for "dateRange" if from date is empty and until date is in the future but less than due date', function() {
        expect($filter('filterByDue')(mockPlusThreeDays, 'dateRange', emptyFromDateAndUntilDateInTheFuture).length).toBe(0);
      });

      it('shows the result for "dateRange" if from date is empty and until date is in the future but equals due date', function() {
        expect($filter('filterByDue')(mockPlusTwoDays, 'dateRange', emptyFromDateAndUntilDateInTheFuture).length).toBe(1);
      });

      it('shows the result for "dateRange" if from date is empty and until date is in the future but bigger than due date', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyFromDateAndUntilDateInTheFuture).length).toBe(1);
      });

      it('shows the result for "dateRange" if from date is empty and until date is in the past', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyFromDateAndUntilDateInPast).length).toBe(0);
      });

      it('shows the result for "dateRange" if from date is empty and until date is today', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyFromDateAndUntilDateIsToday).length).toBe(0);
      });

      it('shows the result for "dateRange" if until date is empty and from date is in the past', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyUntilDateAndFromDateInThePast).length).toBe(1);
      });

      it('shows the result for "dateRange" if until date is empty and from date is today', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyUntilDateAndFromDateIsToday).length).toBe(1);
      });

      it('shows the result for "dateRange" if until date is empty and from date is in the future but less than due date', function() {
        expect($filter('filterByDue')(mockPlusThreeDays, 'dateRange', emptyUntilDateAndFromDateInTheFuture).length).toBe(1);
      });

      it('shows the result for "dateRange" if until date is empty and from date is in the future but equals due date', function() {
        expect($filter('filterByDue')(mockPlusTwoDays, 'dateRange', emptyUntilDateAndFromDateInTheFuture).length).toBe(1);
      });

      it('shows the result for "dateRange" if until date is empty and from date is in the future but bigger than due date', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyUntilDateAndFromDateInTheFuture).length).toBe(0);
      });
    });

    describe('due date is in the past', function() {
      beforeEach(function() {
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

      it('shows the result for "overdue"', function() {
        expect($filter('filterByDue')(mockDueDate, 'overdue').length).toBe(1);
      });

      it('hides the result for "dueToday"', function() {
        expect($filter('filterByDue')(mockDueDate, 'dueToday').length).toBe(0);
      });

      it('hides the result for "dueThisWeek"', function() {
        expect($filter('filterByDue')(mockDueDate, 'dueThisWeek').length).toBe(0);
      });

      it('shows the result for "dueInNextFortnight"', function() {
        expect($filter('filterByDue')(mockDueDate, 'dueInNextFortnight').length).toBe(0);
      });

      it('shows the result for "dueInNinetyDays"', function() {
        expect($filter('filterByDue')(mockDueDate, 'dueInNinetyDays').length).toBe(0);
      });

      it('hides the result for "dateRange" in the future', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', futureDateRange).length).toBe(0);
      });

      it('shows the result for "dateRange" in the past', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', pastDateRange).length).toBe(1);
      });

      it('shows the result for "dateRange" if from and until dates are empty', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyDateRange).length).toBe(1);
      });

      it('shows the result for "dateRange" if from date is empty and until date is in the past but less than due date', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyFromDateAndUntilDateInPast).length).toBe(0);
      });

      it('shows the result for "dateRange" if from date is empty and until date is in the past but equals due date', function() {
        expect($filter('filterByDue')(mockMinusTwoDays, 'dateRange', emptyFromDateAndUntilDateInPast).length).toBe(1);
      });

      it('shows the result for "dateRange" if from date is empty and until date is in the past but bigger than due date', function() {
        expect($filter('filterByDue')(mockMinusThreeDays, 'dateRange', emptyFromDateAndUntilDateInPast).length).toBe(1);
      });

      it('shows the result for "dateRange" if from date is empty and until date is today', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyFromDateAndUntilDateIsToday).length).toBe(1);
      });

      it('shows the result for "dateRange" if from date is empty and until date is in the future', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyFromDateAndUntilDateInTheFuture).length).toBe(1);
      });

      it('shows the result for "dateRange" if until date is empty and from date is in the past but less than due date', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyUntilDateAndFromDateInThePast).length).toBe(1);
      });

      it('shows the result for "dateRange" if until date is empty and from date is in the past but equals due date', function() {
        expect($filter('filterByDue')(mockMinusTwoDays, 'dateRange', emptyUntilDateAndFromDateInThePast).length).toBe(1);
      });

      it('shows the result for "dateRange" if until date is empty and from date is in the past but bigger than due date', function() {
        expect($filter('filterByDue')(mockMinusThreeDays, 'dateRange', emptyUntilDateAndFromDateInThePast).length).toBe(0);
      });

      it('shows the result for "dateRange" if until date is empty and from date is today', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyUntilDateAndFromDateIsToday).length).toBe(0);
      });

      it('shows the result for "dateRange" if until date is empty and from date is in the future', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyUntilDateAndFromDateInTheFuture).length).toBe(0);
      });
    });

    describe('due date is today', function() {
      beforeEach(function() {
        mockDueDate = [{
          activity_date_time: today
        }];
      });

      it('hides the result for "overdue"', function() {
        expect($filter('filterByDue')(mockDueDate, 'overdue').length).toBe(0);
      });

      it('shows the result for "dueToday"', function() {
        expect($filter('filterByDue')(mockDueDate, 'dueToday').length).toBe(1);
      });

      it('hides the result for "dueThisWeek"', function() {
        expect($filter('filterByDue')(mockDueDate, 'dueThisWeek').length).toBe(0);
      });

      it('shows the result for "dueInNextFortnight"', function() {
        expect($filter('filterByDue')(mockDueDate, 'dueInNextFortnight').length).toBe(1);
      });

      it('shows the result for "dueInNinetyDays"', function() {
        expect($filter('filterByDue')(mockDueDate, 'dueInNinetyDays').length).toBe(1);
      });

      it('hides the result for "dateRange" in the future', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', futureDateRange).length).toBe(0);
      });

      it('hides the result for "dateRange" in the past', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', pastDateRange).length).toBe(0);
      });

      it('shows the result for "dateRange" if from and until dates are empty', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyDateRange).length).toBe(1);
      });

      it('shows the result for "dateRange" if from date is empty and until date is in the past', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyFromDateAndUntilDateInPast).length).toBe(0);
      });

      it('shows the result for "dateRange" if from date is empty and until date is today', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyFromDateAndUntilDateIsToday).length).toBe(1);
      });

      it('shows the result for "dateRange" if from date is empty and until date is in the future', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyFromDateAndUntilDateInTheFuture).length).toBe(1);
      });

      it('shows the result for "dateRange" if until date is empty and from date is in the past', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyUntilDateAndFromDateInThePast).length).toBe(1);
      });

      it('shows the result for "dateRange" if until date is empty and from date is today', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyUntilDateAndFromDateIsToday).length).toBe(1);
      });

      it('shows the result for "dateRange" if until date is empty and from date is in the future', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyUntilDateAndFromDateInTheFuture).length).toBe(0);
      });
    });

    describe('due date is empty', function() {
      beforeEach(function() {
        mockDueDate = [{
          activity_date_time: null
        }];
      });

      it('hides the result for "overdue"', function() {
        expect($filter('filterByDue')(mockDueDate, 'overdue').length).toBe(0);
      });

      it('hides the result for "dueToday"', function() {
        expect($filter('filterByDue')(mockDueDate, 'dueToday').length).toBe(0);
      });

      it('hides the result for "dueThisWeek"', function() {
        expect($filter('filterByDue')(mockDueDate, 'dueThisWeek').length).toBe(0);
      });

      it('hides the result for "dueInNextFortnight"', function() {
        expect($filter('filterByDue')(mockDueDate, 'dueInNextFortnight').length).toBe(0);
      });

      it('hides the result for "dueInNinetyDays"', function() {
        expect($filter('filterByDue')(mockDueDate, 'dueInNinetyDays').length).toBe(0);
      });

      it('hides the result for "dateRange" in the future', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', futureDateRange).length).toBe(0);
      });

      it('hides the result for "dateRange" in the past', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', pastDateRange).length).toBe(0);
      });

      it('shows the result for "dateRange" if from and until dates are empty', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyDateRange).length).toBe(1);
      });

      it('shows the result for "dateRange" if from date is empty and until date is in the past', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyFromDateAndUntilDateInPast).length).toBe(0);
      });

      it('shows the result for "dateRange" if from date is empty and until date is today', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyFromDateAndUntilDateIsToday).length).toBe(0);
      });

      it('shows the result for "dateRange" if from date is empty and until date is in the future', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyFromDateAndUntilDateInTheFuture).length).toBe(0);
      });

      it('shows the result for "dateRange" if until date is empty and from date is in the past', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyUntilDateAndFromDateInThePast).length).toBe(1);
      });

      it('shows the result for "dateRange" if until date is empty and from date is today', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyUntilDateAndFromDateIsToday).length).toBe(1);
      });

      it('shows the result for "dateRange" if until date is empty and from date is in the future', function() {
        expect($filter('filterByDue')(mockDueDate, 'dateRange', emptyUntilDateAndFromDateInTheFuture).length).toBe(1);
      });
    });

    describe('test dueInNextFortnight', function(){
      it("show the result if date is after 13 days", function() {
        mockDueDate = [{
          activity_date_time: new Date(today.setDate(today.getDate() + 13))
        }];
        expect($filter('filterByDue')(mockDueDate, 'dueInNextFortnight').length).toBe(1);
      });

      it("show the result if date is after 14 days", function() {
        mockDueDate = [{
          activity_date_time: new Date(today.setDate(today.getDate() + 14))
        }];
        expect($filter('filterByDue')(mockDueDate, 'dueInNextFortnight').length).toBe(1);
      });

      it("hide the result if date is after 15 days", function() {
        mockDueDate = [{
          activity_date_time: new Date(today.setDate(today.getDate() + 15))
        }];
        expect($filter('filterByDue')(mockDueDate, 'dueInNextFortnight').length).toBe(0);
      });
    });

    describe('test dueInNinetyDays', function(){
      it("show the result if date is after 89 days", function() {
        mockDueDate = [{
          activity_date_time: new Date(today.setDate(today.getDate() + 89))
        }];
        expect($filter('filterByDue')(mockDueDate, 'dueInNinetyDays').length).toBe(1);
      });

      it("show the result if date is after 90 days", function() {
        mockDueDate = [{
          activity_date_time: new Date(today.setDate(today.getDate() + 90))
        }];
        expect($filter('filterByDue')(mockDueDate, 'dueInNinetyDays').length).toBe(1);
      });

      it("hide the result if date is after 91 days", function() {
        mockDueDate = [{
          activity_date_time: new Date(today.setDate(today.getDate() + 91))
        }];
        expect($filter('filterByDue')(mockDueDate, 'dueInNinetyDays').length).toBe(0);
      });
    });
  });
});
