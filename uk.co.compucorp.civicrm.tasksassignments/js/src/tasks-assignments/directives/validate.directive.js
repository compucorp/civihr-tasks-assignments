/* eslint-env amd */

define([
  'common/angular'
], function (angular) {
  'use strict';

  taValidate.$inject = ['$log'];

  function taValidate ($log) {
    $log.debug('Directive: taValidate');

    return {
      restrict: 'A',
      require: '^form',
      link: link,
      scope: {
        isWarning: '=?taValidateWarning'
      }
    };

    function link ($scope, el, attrs, formCtrl) {
      var inputEl = el[0].querySelector('[name]');
      var inputNgEl = angular.element(inputEl);
      var inputName = inputNgEl.attr('name');
      var iconEl = document.createElement('span');
      var iconNgEl = angular.element(iconEl);

      if (!inputName) {
        return;
      }

      el.addClass('has-feedback');
      iconNgEl.addClass('glyphicon form-control-feedback');
      inputNgEl.after(iconNgEl);

      $scope.$watch(function () {
        return formCtrl[inputName] && formCtrl[inputName].$invalid;
      }, function (invalid) {
        if (formCtrl[inputName].$dirty) {
          toggleSuccess(invalid, $scope.isWarning);
          toggleError(invalid);
        }
      });

      if (typeof $scope.isWarning !== 'undefined') {
        $scope.$watch('isWarning', function (isWarning) {
          var invalid = formCtrl[inputName].$invalid;
          if (formCtrl[inputName].$dirty) {
            toggleSuccess(invalid, isWarning);
            toggleWarning(invalid, isWarning);
          }
        });
      }

      inputNgEl.bind('blur', function () {
        toggleError(formCtrl[inputName].$invalid);
      });

      function toggleError (invalid) {
        el.toggleClass('has-error', invalid);
        iconNgEl.toggleClass('glyphicon-remove', invalid);
      }

      function toggleSuccess (invalid, isWarning) {
        el.toggleClass('has-success', !invalid && !isWarning);
        iconNgEl.toggleClass('glyphicon-ok', !invalid && !isWarning);
      }

      function toggleWarning (invalid, isWarning) {
        el.toggleClass('has-warning', !invalid && isWarning);
        iconNgEl.toggleClass('glyphicon-warning-sign', !invalid && isWarning);
      }
    }
  }

  return { taValidate: taValidate };
});
