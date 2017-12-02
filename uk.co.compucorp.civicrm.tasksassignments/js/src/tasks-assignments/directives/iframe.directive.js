/* eslint-env amd */

define([
  'tasks-assignments/directives/directives'
], function (directives) {
  'use strict';

  directives.directive('taIframe', ['$rootScope', '$log', function ($rootScope, $log) {
    $log.debug('Directive: taIframe');

    return {
      link: function ($scope, el, attrs) {
        var iframeEl = el[0];

        iframeEl.addEventListener('load', function () {
          var document = window.frames[attrs.name].document;
          var hideElements = [
            'branding',
            'toolbar',
            'civicrm-menu',
            'civicrm-footer',
            'access'
          ];
          var i = 0;
          var el2hide;
          var len = hideElements.length;

          for (i; i < len; i++) {
            el2hide = document.getElementById(hideElements[i]);
            if (!el2hide) {
              continue;
            }
            el2hide.style.display = 'none';
          }

          document.body.style.paddingTop = '10px';
          iframeEl.height = document.body.scrollHeight + 'px';
          el.addClass('ct-iframe-ready');
          $rootScope.$broadcast('iframe-ready');
        });
      }
    };
  }]);
});
