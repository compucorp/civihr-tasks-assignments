/* global angular, ts */

(function (angular) {
  'use strict';

  angular.module('crm-tasks-workflows.decorators')
    .config(['$provide', function ($provide) {
      $provide.decorator('crmAddNameDirective', CrmAddNameDecorator);
    }]);

  CrmAddNameDecorator.$inject = [
    '$delegate'
  ];

  function CrmAddNameDecorator ($delegate) {
    var directive = $delegate[0];

    directive.compile = function compile () {
      return function (scope, element, attrs) {
        var input = CRM.$('input', element);

        (function init () {
          initSelect2();
          initWatchers();
          initEvents();
        })();

        scope._resetSelection = function () {
          CRM.$(input).select2('close');
          CRM.$(input).select2('val', '');
          scope[attrs.crmVar] = '';
        };

        function initEvents () {
          CRM.$(input).on('select2-selecting', function (e) {
            scope[attrs.crmVar] = e.val;
            scope.$evalAsync(attrs.crmOnAdd);
            scope.$evalAsync('_resetSelection()');
            e.preventDefault();
          });
        }

        function initSelect2 () {
          CRM.$(input).crmSelect2({
            data: scope[attrs.crmOptions],
            createSearchChoice: function (term) {
              return {id: term, text: term + ' (' + ts('new') + ')'};
            },
            createSearchChoicePosition: 'bottom',
            placeholder: attrs.placeholder
          });
        }

        function initWatchers () {
          scope.$watch(attrs.crmOptions, initSelect2);
        }
      };
    };

    return $delegate;
  }

  return CrmAddNameDecorator;
})(angular);
