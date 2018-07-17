/* global angular */

(function (angular, CRM) {
  'use strict';

  angular.module('crm-tasks-workflows.constants', [])
    .constant('customFieldIds', CRM.vars.customFieldIds);
})(angular, window.CRM || { vars: {} });
