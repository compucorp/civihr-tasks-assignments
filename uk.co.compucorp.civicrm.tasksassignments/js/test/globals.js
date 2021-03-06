(function (CRM) {
  'use strict';

  CRM._.assign(CRM, {
    debug: 1,
    contactId: null,
    adminId: 205,
    tasksAssignments: {
      case_extension: true,
      extensionPath: '/base/tools/extensions/civihr_tasks/uk.co.compucorp.civicrm.tasksassignments',
      permissions: { delete_tasks_and_documents: true },
      settings: {
        documents_tab: 1,
        keydates_tab: 1,
        add_assignment_button_title: undefined,
        is_task_dashboard_default: 1
      }
    }
  });

  CRM.url({
    back: '/index.php?q=*path*&*query*',
    front: '/index.php?q=*path*&*query*'
  });

  window.Drupal = {
    settings: {
      currentCiviCRMUserId: 123
    }
  };
})(CRM);
