/* eslint-env amd */

define([
  'common/angular'
], function (angular) {
  'use strict';

  angular.module('tasks-assignments.constants', []).constant('config', {
    DEBUG: !!+CRM.debug,
    CLASS_NAME_PREFIX: 'ct-',
    CONTACT_ID: CRM.contactId || null,
    LOGGED_IN_CONTACT_ID: CRM.adminId || null,
    path: {
      EXT: CRM.tasksAssignments.extensionPath,
      TPL: CRM.tasksAssignments.extensionPath + 'views/'
    },
    permissions: {
      allowDelete: CRM.tasksAssignments.permissions.delete_tasks_and_documents
    },
    url: {
      REST: CRM.url('civicrm/ajax/rest'),
      ASSIGNMENTS: CRM.url('civicrm/case'),
      CIVI_DASHBOARD: CRM.url('civicrm/'),
      CONTACT: CRM.url('civicrm/contact/view'),
      FILE: '/civicrm/tasksassignments/file',
      CSV_EXPORT: CRM.url('civicrm/tasksassignments')
    },
    status: {
      resolve: {
        /**
         * For documents
         * 1: 'awaiting upload'
         * 2: 'awaiting approval'
         * 3: 'approved'
         * 4: 'rejected'
         */
        DOCUMENT: ['3', '4'],

        /**
         * For tasks
         * 1: "Scheduled"
         * 2: "Completed"
         * 3: "Cancelled"
         * 4: "Left Message"
         * 5: "Unreachable"
         * 6: "Not Required"
         * 7: "Available"
         * 8: "No-show"
         * 9: "Rejected"
         * 10: "Partially Approved"
         */
        TASK: ['2', '3', '6', '8']
      }
    }
  });
});
