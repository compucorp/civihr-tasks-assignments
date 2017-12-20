/* eslint-env amd, jasmine */

define([
    'common/lodash',
    'mocks/data/key-dates',
    'common/angularMocks',
    'tasks-assignments/modules/tasks-assignments.dashboard.module'
  ], function (_, keyDatesMock) {
    'use strict';

    describe('unique', function () {
      var filter, withDateContactList, withoutDateContactList;

      beforeEach(module('tasks-assignments.dashboard'));
      beforeEach(inject(function ($filter) {
        withDateContactList = keyDatesMock.withDateContactList();
        withoutDateContactList = keyDatesMock.withoutDateContactList();

        filter = $filter('unique');
      }));

      describe('when filtering array of data by a date', function () {
        it('returns data that are unique', function () {
          expect(filter(withDateContactList, 'date')).toEqual(_.uniq(withDateContactList, 'date'));
          expect(filter(withoutDateContactList, 'contact_id')).toEqual(_.uniq(withoutDateContactList, 'contact_id'));
        });
      });
    });
  });
