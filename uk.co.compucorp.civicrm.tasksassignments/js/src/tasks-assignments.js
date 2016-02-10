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
