/* eslint-env amd */

define([
  'common/angular',
  'tasks-assignments/tasks-assignments.constants',
  'tasks-assignments/tasks-assignments.directives',
  'tasks-assignments/documents/tasks-assignments.documents.module'
], function (angular) {
  angular.module('ssp-upload-document.core', [
    'tasks-assignments.constants',
    'tasks-assignments.directives',
    'tasks-assignments.documents'
  ]);
});
