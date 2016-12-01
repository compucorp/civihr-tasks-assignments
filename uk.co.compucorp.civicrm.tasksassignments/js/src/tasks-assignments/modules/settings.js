define([
    'common/angular'
], function (angular) {
    'use strict';

    angular.module('civitasks.settings',[]).value('settings',{
        tabEnabled: {
            documents: CRM.Tasksassignments.settings.documents_tab,
            keyDates: CRM.Tasksassignments.settings.keydates_tab
        },
        extEnabled: {
            assignments: CRM.Tasksassignments.case_extension
        },
        copy: {
            button: {
                assignmentAdd: CRM.Tasksassignments.settings.add_assignment_button_title
            }
        },
        isTaskDashboardDefault: CRM.Tasksassignments.settings.is_task_dashboard_default,
        daysToCreateADocumentClone: CRM.Tasksassignments.settings.days_to_create_a_document_clone
    });
});
