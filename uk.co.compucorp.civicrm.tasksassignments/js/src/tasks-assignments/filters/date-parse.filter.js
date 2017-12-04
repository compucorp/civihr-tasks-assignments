/* eslint-env amd */

define([
  'common/moment'
], function (moment) {
  'use strict';

  dateParse.__name = 'dateParse';
  dateParse.$inject = ['$filter', '$log'];

  function dateParse ($filter, $log) {
    $log.debug('Filter: dateParse');

    return function (input) {
      return moment(input).toDate();
    };
  }

  return dateParse;
});
