var module, reqTa = require.config({
    context: 'tasksassignments',
    baseUrl: CRM.Tasksassignments.extensionPath+'js',
    urlArgs: "bust=" + (new Date()).getTime(),
    paths: {
        angularSelect: 'vendor/angular/select',
        angularBootstrapCalendar: 'vendor/angular/angular-bootstrap-calendar-tpls-custom',
        angularChecklistModel: 'vendor/angular/checklist-model',
        angularRouter: 'vendor/angular/angular-ui-router',
        angularXeditable: 'vendor/angular/xeditable',
        civiEditable: 'vendor/angular/civi-editable',
        moment: 'vendor/moment.min',
        requireLib: CRM.vars.reqAngular.requireLib,
        textAngular: 'vendor/angular/textAngular.min',
        textAngularRangy: 'vendor/angular/textAngular-rangy.min',
        textAngularSanitize: 'vendor/angular/textAngular-sanitize.min'
    },
    shim: {
        civiEditable: {
            deps: ['angularXeditable','angularSelect']
        },
        textAngular: {
            deps: ['textAngularRangy','textAngularSanitize']
        }
    },
    config: {
        moment: {
            noGlobal: true
        }
    }
});

reqTa([
    'app',
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
    'directives/civiEvents',
    'directives/iframe',
    'directives/spinner',
    'directives/validate',
    'filters/assignmentType',
    'filters/contactId',
    'filters/date',
    'filters/dateParse',
    'filters/dateType',
    'filters/due',
    'filters/offset',
    'filters/userRole',
    'filters/status',
    'requireLib'
],function(){
    'use strict';

    document.addEventListener('taInit', function(e){
        angular.bootstrap(document.getElementById(e.detail.module),
            ['civitasks.'+ e.detail.app]);
    });

    document.dispatchEvent(typeof window.CustomEvent == "function" ? new CustomEvent('taReady') : (function(){
        var e = document.createEvent('Event');
        e.initEvent('taReady', true, true);
        return e;
    })());
})