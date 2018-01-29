/* eslint-env amd */

define([
  'common/angular'
], function (angular) {
  'use strict';

  angular.module('tasks-assignments.values', []).value('settings', {
    tabEnabled: {
      documents: CRM.tasksAssignments.settings.documents_tab,
      keyDates: CRM.tasksAssignments.settings.keydates_tab
    },
    extEnabled: {
      assignments: CRM.tasksAssignments.case_extension
    },
    copy: {
      button: {
        assignmentAdd: CRM.tasksAssignments.settings.add_assignment_button_title
      }
    },
    isTaskDashboardDefault: CRM.tasksAssignments.settings.is_task_dashboard_default,
    daysToCreateADocumentClone: CRM.tasksAssignments.settings.days_to_create_a_document_clone
  });
});
