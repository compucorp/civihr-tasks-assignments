/* eslint-env amd */

define([
  'common/moment'
], function (moment) {
  'use strict';

  dateParse.$inject = ['$log'];

  function dateParse ($log) {
    $log.debug('Filter: dateParse');

    return function (input) {
      return moment(input).toDate();
    };
  }

  return { dateParse: dateParse };
});
