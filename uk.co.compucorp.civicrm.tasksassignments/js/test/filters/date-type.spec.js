/* eslint-env amd, jasmine */

define([
  'mocks/data/key-dates',
  'common/angularMocks',
  'tasks-assignments/modules/tasks-assignments.dashboard.module'
], function (keyDatesMock) {
  'use strict';

  describe('filterByDateType', function () {
    var filter, withDateContactList, withoutDateContactList;

    beforeEach(module('tasks-assignments.dashboard'));
    beforeEach(inject(function ($filter) {
      withDateContactList = keyDatesMock.withDateContactList();
      withoutDateContactList = keyDatesMock.withoutDateContactList();

      filter = $filter('filterByDateType');
    }));

    describe('when filtering array of key dates with dateContactList property', function () {
      it('returns key dates that are of expected date types', function () {
        expect(filter(withDateContactList, 'birth_date')).toEqual(filterDates(withDateContactList, 'birth_date'));
        expect(filter(withDateContactList, 'period_end_date')).toEqual(filterDates(withDateContactList, 'period_end_date'));
        expect(filter(withDateContactList, 'period_start_date')).toEqual(filterDates(withDateContactList, 'period_start_date'));
      });
    });

    describe('when filtering array of key dates without dateContactList property', function () {
      it('returns key dates that are of expected date types', function () {
        expect(filter(withoutDateContactList, 'birth_date')).toEqual(filterDates(withoutDateContactList, 'birth_date'));
        expect(filter(withoutDateContactList, 'period_end_date')).toEqual(filterDates(withoutDateContactList, 'period_end_date'));
        expect(filter(withoutDateContactList, 'period_start_date')).toEqual(filterDates(withoutDateContactList, 'period_start_date'));
      });
    });
  });

  /**
   * Filter to generate expected data
   *
   * @param  {Array}  inputArray
   * @param  {String}  dateType
   * @return {Array}
   */
  function filterDates (inputArray, dateType) {
    return inputArray.filter(function (singleDate) {
      return singleDate.dateContactList
        ? singleDate.dateContactList[0].type.indexOf(dateType) !== -1
        : singleDate.type.indexOf(dateType) !== -1;
    });
  }
});
