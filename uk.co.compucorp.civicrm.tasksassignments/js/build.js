({
    baseUrl : 'src',
    out: 'dist/tasks-assignments.min.js',
    name: 'tasks-assignments',
    skipModuleInsertion: true,
    paths: {
        'common': 'empty:',
        'tasks-assignments/vendor/angular-bootstrap-calendar': 'tasks-assignments/vendor/angular/angular-bootstrap-calendar-tpls-custom',
        'tasks-assignments/vendor/angular-checklist-model': 'tasks-assignments/vendor/angular/checklist-model',
        'tasks-assignments/vendor/angular-router': 'tasks-assignments/vendor/angular/angular-ui-router',
        'tasks-assignments/vendor/angular-select': 'tasks-assignments/vendor/angular/select',
        'tasks-assignments/vendor/angular-xeditable': 'tasks-assignments/vendor/angular/xeditable',
        'tasks-assignments/vendor/angular-xeditable-civi': 'tasks-assignments/vendor/angular/xeditable-civi',
        'tasks-assignments/vendor/text-angular': 'tasks-assignments/vendor/angular/textAngular.min',
        'tasks-assignments/vendor/text-angular-rangy': 'tasks-assignments/vendor/angular/textAngular-rangy.min',
        'tasks-assignments/vendor/text-angular-sanitize': 'tasks-assignments/vendor/angular/textAngular-sanitize.min'
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
})
