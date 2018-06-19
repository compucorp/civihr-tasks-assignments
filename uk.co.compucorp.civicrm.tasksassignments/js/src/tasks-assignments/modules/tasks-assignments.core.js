/* eslint-env amd */

define([
  'common/angular',
  'common/ui-select',
  'common/models/option-group',
  'common/models/relationship.model',
  'common/models/session.model',
  'common/modules/xeditable-civi',
  'common/modules/routers/compu-ui-router',
  'common/directives/angular-date/date-input',
  'common/directives/help-text.directive',
  'common/directives/prevent-animations',
  'common/directives/loading',
  'common/filters/angular-date/format-date',
  'common/services/angular-date/date-format',
  'common/services/before-hash-query-params.service',
  'common/services/crm-ang.service',
  'tasks-assignments/vendor/angular-bootstrap-calendar',
  'tasks-assignments/vendor/angular-checklist-model',
  'tasks-assignments/vendor/angular-router',
  'tasks-assignments/modules/tasks-assignments.constants',
  'tasks-assignments/modules/tasks-assignments.values'
], function (angular) {
  'use strict';

  angular.module('tasks-assignments.core', [
    'ngAnimate',
    'ngResource',
    'ngSanitize',
    'angularFileUpload',
    'mwl.calendar',
    'textAngular',
    'ui.select',
    'xeditable',
    'xeditable-civi',
    'checklist-model',
    'common.angularDate',
    'common.directives',
    'common.models',
    'compu.ui.router'
  ]);
});
