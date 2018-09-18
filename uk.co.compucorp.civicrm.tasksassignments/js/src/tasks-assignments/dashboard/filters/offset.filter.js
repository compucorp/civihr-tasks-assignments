/* eslint-env amd */

define(function () {
  'use strict';

  offset.$inject = ['$log'];

  function offset ($log) {
    $log.debug('Filter: offset');

    return function (inputArr, start) {
      start = start || 0;
      return inputArr.slice(parseInt(start, 10));
    };
  }

  return { offset: offset };
});
