define(function(){
    'use strict'

    var constants = angular.module('civitasks.config',[]);

    constants.constant('config',{
        DEBUG: !!+CRM.debug,
        CLASS_NAME_PREFIX: 'ct-',
        CONTACT_ID: CRM.contactId ||null,
        LOGGED_IN_CONTACT_ID: CRM.adminId ||null,
        path: {
            EXT: CRM.Tasksassignments.extensionPath,
            TPL: CRM.Tasksassignments.extensionPath + 'views/'
        },
        permissions: {
            allowDelete: CRM.Tasksassignments.permissions.delete_tasks_and_documents
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
                //TODO
                DOCUMENT: ['3', '4'],
                TASK: ['2', '3', '6', '8']
            }
        }
    });

    return constants;
});