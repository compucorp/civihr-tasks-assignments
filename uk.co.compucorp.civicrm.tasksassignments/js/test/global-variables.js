CRM.debug = 1;
CRM.contactId = null;
CRM.adminId = 205;

CRM.url({
    back: '/index.php?q=*path*&*query*',
    front: '/index.php?q=*path*&*query*'
});

CRM.Tasksassignments = {
    case_extension: true,
    extensionPath: '/base/tools/extensions/civihr_tasks/uk.co.compucorp.civicrm.tasksassignments',
    permissions: { delete_tasks_and_documents: true },
    settings: { documents_tab: 1 },
    settings: { keydates_tab: 1 },
    settings: { add_assignment_button_title: undefined },
    settings: { is_task_dashboard_default: 1 }
};
