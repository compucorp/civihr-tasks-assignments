/* eslint-env amd, jasmine */

define([
  'common/angularMocks',
  'tasks-notification-badge/app'
], function () {
  'use strict';

  describe('tasksNotificationBadge', function () {
    var controller, $componentController, $log, $rootScope;

    beforeEach(module('tasks-notification-badge'));
    beforeEach(inject(function (_$componentController_, _$log_, _$rootScope_) {
      $componentController = _$componentController_;
      $log = _$log_;
      $rootScope = _$rootScope_;
      spyOn($log, 'debug');
      spyOn($rootScope, '$emit');

      compileComponent();
    }));

    it('is initialized', function () {
      expect($log.debug).toHaveBeenCalled();
    });

    it('filters the Tasks where status is not completed and assignee is the logged in user', function () {
      expect(controller.filters[0]).toEqual({
        apiName: 'Task',
        params: {
          status_id: { '!=': 'Completed' },
          assignee_contact_id: window.Drupal.settings.currentCiviCRMUserId
        }
      });
    });

    it('filters the Documents where status is awaiting upload and assignee is the logged in user', function () {
      expect(controller.filters[1]).toEqual({
        apiName: 'Document',
        params: {
          status_id: 'awaiting upload',
          assignee_contact_id: window.Drupal.settings.currentCiviCRMUserId
        }
      });
    });

    function compileComponent () {
      controller = $componentController('tasksNotificationBadge', null, {});
      $rootScope.$digest();
    }
  });
});
