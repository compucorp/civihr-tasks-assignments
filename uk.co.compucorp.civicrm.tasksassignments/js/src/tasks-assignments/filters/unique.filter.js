/* eslint-env amd */

define([
  'common/lodash',
], function (_) {
  'use strict';

  uniqueFilter.__name = 'unique';
  uniqueFilter.$inject = ['$filter', '$rootScope', '$log'];

  function uniqueFilter ($filter, $rootScope, $log) {
    $log.debug('Filter: unique');

    /**
     * Filters the array to return unique values
     *
     * @param  {Array} inputArray
     * @param  {Array} identifier to filter by
     * @return {Array}
     */
    return function (inputArray, identifier) {
      if(!inputArray.length) {
        return inputArray;
      }

      return _.uniq(inputArray, identifier);
    };
  }

  return uniqueFilter;
});
