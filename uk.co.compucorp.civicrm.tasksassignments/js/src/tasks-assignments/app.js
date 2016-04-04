define([
    'tasks-assignments/modules/config',
    'tasks-assignments/modules/settings',
    'tasks-assignments/modules/run',
    'tasks-assignments/modules/app-dashboard',
    'tasks-assignments/modules/app-documents',
    'tasks-assignments/modules/app-tasks',
    'tasks-assignments/modules/app-settings',
    'tasks-assignments/controllers/controllers',
    'tasks-assignments/controllers/calendar',
    'tasks-assignments/controllers/date-list',
    'tasks-assignments/controllers/document-list',
    'tasks-assignments/controllers/document',
    'tasks-assignments/controllers/assignments',
    'tasks-assignments/controllers/main',
    'tasks-assignments/controllers/task-list',
    'tasks-assignments/controllers/task',
    'tasks-assignments/controllers/dashboard/nav-main',
    'tasks-assignments/controllers/dashboard/top-bar',
    'tasks-assignments/controllers/modal/modal-dialog',
    'tasks-assignments/controllers/modal/modal-document',
    'tasks-assignments/controllers/modal/modal-progress',
    'tasks-assignments/controllers/modal/modal-task',
    'tasks-assignments/controllers/modal/modal-task-migrate',
    'tasks-assignments/controllers/modal/modal-reminder',
    'tasks-assignments/controllers/modal/modal-assignment',
    'tasks-assignments/controllers/external-page',
    'tasks-assignments/controllers/settings',
    'tasks-assignments/directives/directives',
    'tasks-assignments/directives/civi-events',
    'tasks-assignments/directives/iframe',
    'tasks-assignments/directives/spinner',
    'tasks-assignments/directives/validate',
    'tasks-assignments/filters/filters',
    'tasks-assignments/filters/assignment-type',
    'tasks-assignments/filters/contact-id',
    'tasks-assignments/filters/date',
    'tasks-assignments/filters/date-parse',
    'tasks-assignments/filters/date-type',
    'tasks-assignments/filters/due',
    'tasks-assignments/filters/offset',
    'tasks-assignments/filters/user-role',
    'tasks-assignments/filters/status',
    'tasks-assignments/services/services',
], function () {
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
