/* eslint-env amd */

define(function () {
  'use strict';

  filterByContactId.$inject = ['$log'];

  function filterByContactId ($log) {
    $log.debug('Filter: filterByContactId');

    return function (inputArr, contactId) {
      var filteredArr = [];
      var i = 0;
      var inputArrlen = inputArr.length;

      if (!inputArrlen || !contactId || typeof +contactId !== 'number') {
        return inputArr;
      }

      for (i; i < inputArrlen; i++) {
        if (+inputArr[i].assignee_contact_id[0] === +contactId ||
          +inputArr[i].source_contact_id === +contactId ||
          +inputArr[i].target_contact_id === +contactId) {
          filteredArr.push(inputArr[i]);
        }
      }
      return filteredArr;
    };
  }

  return { filterByContactId: filterByContactId };
});
