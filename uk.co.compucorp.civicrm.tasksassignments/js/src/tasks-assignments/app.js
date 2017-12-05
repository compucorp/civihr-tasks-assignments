/* eslint-env amd */

define([
  'common/angular'
], function (angular) {
  'use strict';

  document.addEventListener('taInit', function (e) {
    angular.bootstrap(document.getElementById(e.detail.module), ['task-assignments.' + e.detail.app]);
  });

  document.dispatchEvent(typeof window.CustomEvent === 'function' ? new window.CustomEvent('taReady') : (function () {
    var e = document.createEvent('Event');

    e.initEvent('taReady', true, true);

    return e;
  })());
});
