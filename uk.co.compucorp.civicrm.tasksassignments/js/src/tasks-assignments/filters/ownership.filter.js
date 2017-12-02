/* eslint-env amd */

define([
  'tasks-assignments/filters/filters'
], function (filters) {
  'use strict';

  filters.filter('filterByOwnership', ['$log', 'config', function ($log, config) {
    $log.debug('Filter: filterByOwnership');

    var filters = {
      assigned: function (item) {
        return ~item.assignee_contact_id.indexOf(config.LOGGED_IN_CONTACT_ID);
      },
      delegated: function (item) {
        return item.source_contact_id === config.LOGGED_IN_CONTACT_ID &&
        !~item.assignee_contact_id.indexOf(config.LOGGED_IN_CONTACT_ID);
      }
    };

    return function (list, ownershipType) {
      try {
        return list.filter(filters[ownershipType]);
      } catch (e) {
        return list;
      }
    };
  }]);
});
