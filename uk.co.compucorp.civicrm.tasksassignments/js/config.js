define(function(){
    'use strict'

    var constants = angular.module('civitasks.config',[]);

    constants.constant('config',{
        DEBUG: true,
        CLASS_NAME_PREFIX: 'ct-',
        CONTACT_ID: CRM.contactId ||null,
        LOGGED_IN_CONTACT_ID: CRM.adminId ||null,
        path: {
            EXT: CRM.Tasksassignments.extensionPath,
            TPL: CRM.Tasksassignments.extensionPath + 'views/',
            REST: CRM.url('civicrm/ajax/rest')
        }
    });

    return constants;
})