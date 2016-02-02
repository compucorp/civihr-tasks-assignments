// require.config({
//     context: 'tasksassignments',
//     baseUrl: CRM.Tasksassignments.extensionPath+'js',
//     urlArgs: "bust=" + (new Date()).getTime(),
//     paths: {
//         angularSelect: 'vendor/angular/select',
//         angularBootstrapCalendar: 'vendor/angular/angular-bootstrap-calendar-tpls-custom',
//         angularChecklistModel: 'vendor/angular/checklist-model',
//         angularRouter: 'vendor/angular/angular-ui-router',
//         angularXeditable: 'vendor/angular/xeditable',
//         angularXeditableCivi: 'vendor/angular/xeditable-civi',
//         moment: 'vendor/moment.min',
//         textAngular: 'vendor/angular/textAngular.min',
//         textAngularRangy: 'vendor/angular/textAngular-rangy.min',
//         textAngularSanitize: 'vendor/angular/textAngular-sanitize.min'
//     },
//     shim: {
//         angularXeditableCivi: {
//             deps: ['angularXeditable','angularSelect','textAngular']
//         },
//         textAngular: {
//             deps: ['textAngularRangy','textAngularSanitize']
//         }
//     },
//     config: {
//         moment: {
//             noGlobal: true
//         }
//     }
// })(['app']);

(function () {
    var extPath = CRM.Tasksassignments.extensionPath + 'js/src/tasks-assignments';

    require.config({
        urlArgs: 'bust=' + (new Date()).getTime(),
        paths: {
            'tasks-assignments': extPath,
            'tasks-assignments/vendor/angular-select': extPath + '/vendor/angular/select',
            'tasks-assignments/vendor/angular-bootstrap-calendar': extPath + '/vendor/angular/angular-bootstrap-calendar-tpls-custom',
            'tasks-assignments/vendor/angular-checklist-model': extPath + '/vendor/angular/checklist-model',
            'tasks-assignments/vendor/angular-router': extPath + '/vendor/angular/angular-ui-router',
            'tasks-assignments/vendor/angular-xeditable': extPath + '/vendor/angular/xeditable',
            'tasks-assignments/vendor/angular-xeditable-civi': extPath + '/vendor/angular/xeditable-civi',
            'tasks-assignments/vendor/text-angular': extPath + '/vendor/angular/textAngular.min',
            'tasks-assignments/vendor/text-angular-rangy': extPath + '/vendor/angular/textAngular-rangy.min',
            'tasks-assignments/vendor/text-angular-sanitize': extPath + '/vendor/angular/textAngular-sanitize.min'
        },
        shim: {
            'tasks-assignments/vendor/angular-xeditable-civi': {
                deps: [
                    'tasks-assignments/vendor/angular-xeditable',
                    'tasks-assignments/vendor/angular-select',
                    'tasks-assignments/vendor/text-angular'
                ]
            },
            'tasks-assignments/vendor/text-angular': {
                deps: [
                    'tasks-assignments/vendor/text-angular-rangy',
                    'tasks-assignments/vendor/text-angular-sanitize'
                ]
            }
        }
    });

    require(['tasks-assignments/app']);
})(require);
