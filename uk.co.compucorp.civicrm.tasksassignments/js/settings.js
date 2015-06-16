define(function(){
    'use strict'

    var values = angular.module('civitasks.settings',[]);

    values.value('settings',{
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
        }
    });

    return values;
});