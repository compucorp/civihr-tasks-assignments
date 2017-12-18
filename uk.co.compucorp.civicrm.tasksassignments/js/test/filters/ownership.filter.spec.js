/* eslint-env amd, jasmine */

define([
  'common/angularMocks',
  'tasks-assignments/modules/tasks-assignments.dashboard.module'
], function () {
  'use strict';

  describe('filterByOwnership', function () {
    var config, filter, mockedTasks;

    beforeEach(module('tasks-assignments.dashboard'));
    beforeEach(inject(function (_config_, $filter) {
      (config = _config_) && (config.LOGGED_IN_CONTACT_ID = '205');
      mockedTasks = mockData();

      filter = $filter('filterByOwnership');
    }));

    describe('with "assigned" as a parameter', function () {
      it('returns only the activities assigned to the current user', function () {
        expect(filter(mockedTasks, 'assigned')).toEqual(mockedTasks.filter(function (task) {
          return ~task.assignee_contact_id.indexOf(config.LOGGED_IN_CONTACT_ID);
        }));
      });
    });

    describe('with "delegated" as a parameter', function () {
      it('returns only the activities that have been delegated by the current user', function () {
        expect(filter(mockedTasks, 'delegated')).toEqual(mockedTasks.filter(function (task) {
          return !~task.assignee_contact_id.indexOf(config.LOGGED_IN_CONTACT_ID) &&
            task.source_contact_id === config.LOGGED_IN_CONTACT_ID;
        }));
      });
    });

    describe('with nothing/null as a parameter', function () {
      it('returns the list unfiltered', function () {
        expect(filter(mockedTasks, null)).toEqual(mockedTasks);
      });
    });

    /**
     * The mocked activities
     *
     * @return {Array}
     */
    function mockData () {
      return [{
        activity_date_time: '2016-08-21T22:00:00.000Z',
        activity_type_id: '65',
        details: 'Lorem ipsum dolor',
        id: '634',
        subject: 'Aenean in malesuada',
        status_id: '1',
        assignee_contact_id: ['205'],
        source_contact_id: '204',
        target_contact_id: ['202']
      },
      {
        activity_date_time: '2016-08-21T22:00:00.000Z',
        activity_type_id: '65',
        details: 'sit amet, consectetur',
        id: '635',
        subject: 'Nec sollicitudin purus.',
        status_id: '1',
        assignee_contact_id: ['205'],
        source_contact_id: '205',
        target_contact_id: ['202']
      },
      {
        activity_date_time: '2016-08-21T22:00:00.000Z',
        activity_type_id: '65',
        details: 'adipiscing elit',
        id: '636',
        subject: 'Aliquam elementum sapien',
        status_id: '1',
        assignee_contact_id: ['205'],
        source_contact_id: '205',
        target_contact_id: ['202']
      },
      {
        activity_date_time: '2016-08-21T22:00:00.000Z',
        activity_type_id: '65',
        details: 'Aliquam eget ligula',
        id: '637',
        subject: 'In suscipit placerat',
        status_id: '1',
        assignee_contact_id: ['204'],
        source_contact_id: '205',
        target_contact_id: ['202']
      },
      {
        activity_date_time: '2016-08-21T22:00:00.000Z',
        activity_type_id: '65',
        details: 'in turpis fringilla',
        id: '638',
        subject: 'Proin suscipit neque',
        status_id: '1',
        assignee_contact_id: ['152'],
        source_contact_id: '205',
        target_contact_id: ['202']
      }];
    }
  });
});
