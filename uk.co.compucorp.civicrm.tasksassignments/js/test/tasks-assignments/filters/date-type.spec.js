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

    describe('when filtering array of key dates with dateContactList', function () {
      it('returns correct no, of keydates of type birthday', function () {
        expect(filter(withDateContactList, 'birth_date').length).toEqual(10);
      });

      it('returns correct no. of keydates of type contract start date', function () {
        expect(filter(withDateContactList, 'period_end_date').length).toEqual(7);
      });

      it('returns correct no. of keydates of type contract end date', function () {
        expect(filter(withDateContactList, 'period_start_date').length).toEqual(2);
      });
    });

    describe('when filtering array of key dates without dateContactList property', function () {
      it('returns correct no, of keydates of type birthday', function () {
        expect(filter(withoutDateContactList, 'birth_date').length).toEqual(2);
      });

      it('returns correct no. of keydates of type contract start date', function () {
        expect(filter(withoutDateContactList, 'period_end_date').length).toEqual(2);
      });

      it('returns correct no. of keydates of type contract end date', function () {
        expect(filter(withoutDateContactList, 'period_start_date').length).toEqual(1);
      });
    });
  });
});
