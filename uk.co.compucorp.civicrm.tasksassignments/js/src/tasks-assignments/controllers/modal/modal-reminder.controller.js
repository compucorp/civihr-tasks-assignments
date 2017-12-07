/* eslint-env amd */

define([
  'common/angular'
], function (angular) {
  'use strict';

  ModalReminderController.__name = 'ModalReminderController';
  ModalReminderController.$inject = [
    '$filter', '$log', '$q', '$rootScope', '$scope', '$dialog', '$uibModalInstance',
    'DocumentService', 'TaskService', 'config', 'data', 'type'
  ];

  function ModalReminderController ($filter, $log, $q, $rootScope, $scope, $dialog,
    $modalInstance, DocumentService, TaskService, config, data, type) {
    $log.debug('Controller: ModalReminderController');

    $scope.data = {};
    $scope.type = type;

    angular.copy(data, $scope.data);

    $scope.reminder = {};
    $scope.data.assignee_contact_id = $scope.data.assignee_contact_id || [];
    $scope.data.target_contact_id = $scope.data.target_contact_id || [config.CONTACT_ID];
    $scope.contacts = $rootScope.cache.contact.arrSearch;
    $scope.showCId = !config.CONTACT_ID;

    $scope.cancel = cancel;
    $scope.confirm = confirm;

    function cancel () {
      $modalInstance.dismiss('cancel');
    }

    function confirm () {
      $scope.$broadcast('ct-spinner-show');

      (type === 'task' ? TaskService : DocumentService).sendReminder($scope.data.id, $scope.reminder.notes).then(function () {
        CRM.alert('Message sent to: ' + $rootScope.cache.contact.obj[$scope.data.assignee_contact_id[0]].sort_name,
          'Reminder sent', 'success');
        $modalInstance.close();
        $scope.$broadcast('ta-spinner-hide');
      }, function (reason) {
        CRM.alert(reason, 'Error', 'error');
        $modalInstance.dismiss();
        $scope.$broadcast('ta-spinner-hide');
        return $q.reject();
      });
    }
  }

  return ModalReminderController;
});
