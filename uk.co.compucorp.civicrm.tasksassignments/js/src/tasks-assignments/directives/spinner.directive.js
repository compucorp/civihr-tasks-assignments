/* eslint-env amd */

define(function () {
  'use strict';

  ctSpinner.__name = 'ctSpinner';
  ctSpinner.$inject = ['$rootScope', '$log'];

  function ctSpinner ($rootScope, $log) {
    $log.debug('Directive: ctSpinner');

    return {
      link: function ($scope, el, attrs) {
        var cover = document.createElement('div');
        var positionSet = false;
        var coverSet = false;
        var spinner;

        cover.className = 'ct-spinner-cover ct-spinner-img';

        function isPositioned () {
          var elPosition = window.getComputedStyle(el[0]).position;
          return elPosition === 'relative' || elPosition === 'absolute' || elPosition === 'fixed';
        }

        function appendSpinner () {
          if (!isPositioned()) {
            el.css('position', 'relative');
            positionSet = true;
          }

          el.append(cover);
          coverSet = true;
        }

        function removeSpinner () {
          coverSet && cover.parentNode.removeChild(cover);
          coverSet = false;

          if (positionSet) {
            el.css('position', '');
          }
        }

        if (typeof attrs.ctSpinnerShow !== 'undefined') {
          appendSpinner();
        }

        if (typeof attrs.ctSpinnerMainView !== 'undefined') {
          cover.className = 'ct-spinner-cover';

          spinner = document.createElement('div');
          spinner.className = 'ct-spinner ct-spinner-img';

          $rootScope.$on('$stateChangeStart', function () {
            appendSpinner();
            document.body.appendChild(spinner);
          });

          $rootScope.$on('$stateChangeSuccess', function () {
            removeSpinner();
            spinner.parentNode.removeChild(spinner);
          });

          $rootScope.$on('$stateChangeError', function () {
            removeSpinner();
            spinner.parentNode.removeChild(spinner);
          });
        }

        $scope.$on('ct-spinner-show', function (e, param) {
          if (!param || (attrs.ctSpinnerId && attrs.ctSpinnerId === param)) {
            appendSpinner();
          }
        });

        $scope.$on('ct-spinner-hide', function (e, param) {
          if (!param || (attrs.ctSpinnerId && attrs.ctSpinnerId === param)) {
            removeSpinner();
          }
        });
      }
    };
  }

  return ctSpinner;
});
