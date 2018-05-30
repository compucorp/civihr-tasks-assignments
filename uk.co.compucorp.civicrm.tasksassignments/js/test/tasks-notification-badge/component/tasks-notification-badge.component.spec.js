/* eslint-env amd, jasmine */

define([
  'common/angularMocks',
  'tasks-notification-badge/app'
], function () {
  'use strict';

  describe('tasksNotificationBadge', function () {
    var controller, $componentController, $log, $rootScope, Session;

    beforeEach(module('tasks-notification-badge'));
    beforeEach(inject(function (_$componentController_, _$log_, _$rootScope_, _Session_) {
      $componentController = _$componentController_;
      $log = _$log_;
      $rootScope = _$rootScope_;
      Session = _Session_;
      spyOn($log, 'debug');
      spyOn($rootScope, '$emit');

      compileComponent();
    }));

    it('is initialized', function () {
      expect($log.debug).toHaveBeenCalled();
    });

    describe('filters', function () {
      var loggedInUserID;

      beforeEach(function () {
        Session.get()
          .then(function (session) {
            loggedInUserID = session.contactId;
          });

        $rootScope.$digest();
      });

      it('filters the Tasks where status is not completed and assignee is the logged in user', function () {
        expect(controller.filters[0]).toEqual({
          apiName: 'Task',
          params: {
            status_id: { '!=': 'Completed' },
            assignee_contact_id: loggedInUserID
          }
        });
      });

      it('filters the Documents where status is awaiting upload and assignee is the logged in user', function () {
        expect(controller.filters[1]).toEqual({
          apiName: 'Document',
          params: {
            status_id: 'awaiting upload',
            assignee_contact_id: loggedInUserID,
            is_current_revision: true
          }
        });
      });
    });

    function compileComponent () {
      controller = $componentController('tasksNotificationBadge', null, {});
      $rootScope.$digest();
    }
  });
});
