/* eslint-env amd */

define(function () {
  'use strict';

  filterByAssignmentType.$inject = ['$rootScope', '$log'];

  function filterByAssignmentType ($rootScope, $log) {
    $log.debug('Filter: filterByAssignmentType');

    return function (inputArr, assignmentTypeArr) {
      var assignment;
      var assignmentCacheObj = $rootScope.cache.assignment.obj;
      var assignmentTypeArrLen = assignmentTypeArr.length;
      var filteredArr = [];
      var i = 0;
      var inputArrlen = inputArr.length;

      if (!inputArrlen || !assignmentTypeArrLen) {
        return inputArr;
      }

      for (i; i < inputArrlen; i++) {
        assignment = assignmentCacheObj[inputArr[i].case_id];
        if (assignment &&
          assignmentTypeArr.indexOf(assignment.case_type_id) !== -1) {
          filteredArr.push(inputArr[i]);
        }
      }

      return filteredArr;
    };
  }

  return { filterByAssignmentType: filterByAssignmentType };
});
