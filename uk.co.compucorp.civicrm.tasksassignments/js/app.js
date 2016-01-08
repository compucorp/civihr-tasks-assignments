define([
    'modules/config',
    'modules/settings',
    'modules/run',
    'modules/app-dashboard',
    'modules/app-documents',
    'modules/app-tasks',
    'modules/app-settings',
    'controllers/controllers',
    'controllers/calendar',
    'controllers/dateList',
    'controllers/documentList',
    'controllers/document',
    'controllers/main',
    'controllers/taskList',
    'controllers/task',
    'controllers/dashboard/navMain',
    'controllers/dashboard/topBar',
    'controllers/modal/modalDialog',
    'controllers/modal/modalDocument',
    'controllers/modal/modalProgress',
    'controllers/modal/modalTask',
    'controllers/modal/modalTaskMigrate',
    'controllers/modal/modalReminder',
    'controllers/modal/modalAssignment',
    'controllers/externalPage',
    'controllers/settings',
    'directives/directives',
    'directives/civiEvents',
    'directives/iframe',
    'directives/spinner',
    'directives/validate',
    'filters/filters',
    'filters/assignmentType',
    'filters/contactId',
    'filters/date',
    'filters/dateParse',
    'filters/dateType',
    'filters/due',
    'filters/offset',
    'filters/userRole',
    'filters/status',
    'services/services',
], function(){
    'use strict';
    
    document.addEventListener('taInit', function(e){
        angular.bootstrap(document.getElementById(e.detail.module), ['civitasks.'+ e.detail.app]);
    });

    document.dispatchEvent(typeof window.CustomEvent == "function" ? new CustomEvent('taReady') : (function(){
        var e = document.createEvent('Event');
        e.initEvent('taReady', true, true);
        return e;
    })());
});
