({
    baseUrl : "js",
    name: "ta-main",
    out: "dist/ta-main.js",
    removeCombined: true,
    paths: {
        'angularSelect': 'vendor/angular/select',
        'angularBootstrapCalendar': 'vendor/angular/angular-bootstrap-calendar-tpls-custom',
        'angularChecklistModel': 'vendor/angular/checklist-model',
        'angularRouter': 'vendor/angular/angular-ui-router',
        'angularXeditable': 'vendor/angular/xeditable',
        'angularXeditableCivi': 'vendor/angular/xeditable-civi',
        'moment': 'vendor/moment.min',
        'textAngular': 'vendor/angular/textAngular.min',
        'textAngularRangy': 'vendor/angular/textAngular-rangy.min',
        'textAngularSanitize': 'vendor/angular/textAngular-sanitize.min'
    },
    shim: {
        angularXeditableCivi: {
            deps: ['angularXeditable','angularSelect','textAngular']
        },
        textAngular: {
            deps: ['textAngularRangy','textAngularSanitize']
        }
    },
    deps: ['app'],
    wrap: true
})
