/* eslint-env amd */

define([
  'common/angular',
  'common/lodash'
], function (angular, _) {
  'use strict';

  contactService.$inject = [
    'Contact', '$q', '$filter', '$rootScope', 'utilsService', '$log'
  ];

  function contactService (Contact, $q, $filter, $rootScope, utilsService, $log) {
    $log.debug('Service: contactService');

    return {
      get: get,
      search: search,
      updateCache: updateCache
    };

    function get (id) {
      if (!id || (typeof +id !== 'number' && typeof id !== 'object')) {
        return null;
      }

      var deferred = $q.defer();

      // Get only the unique contact ids to be fetched.
      id = { IN: _.uniq(id.IN) };

      Contact.get({
        'json': {
          'id': id,
          'return': 'display_name, sort_name, id, contact_id, contact_type, email'
        }
      }, function (data) {
        if (utilsService.errorHandler(data, 'Unable to fetch contacts', deferred)) {
          return;
        }

        deferred.resolve(data.values);
      }, function () {
        deferred.reject('Unable to fetch contact');
      });

      return deferred.promise;
    }

    function search (input, customParams) {
      if (customParams && typeof customParams !== 'object') {
        return null;
      }

      var deferred = $q.defer();

      var params = {};

      angular.extend(params, customParams);

      params.display_name = input;
      params.return = 'display_name, contact_id, contact_type, email';

      Contact.get({
        action: 'get',
        json: params
      }, function (data) {
        if (utilsService.errorHandler(data, 'Unable to fetch contact list', deferred)) {
          return;
        }

        var contacts = [];

        for (var i in data.values) {
          contacts.push({
            label: data.values[i].display_name,
            description: [data.values[i].email],
            id: data.values[i].contact_id,
            icon_class: data.values[i].contact_type
          });
        }

        deferred.resolve(contacts);
      }, function () {
        deferred.reject('Unable to fetch contact list');
      });

      return deferred.promise;
    }

    function updateCache (data) {
      var contact, contactId;
      var obj = $rootScope.cache.contact.obj || {};
      var arr = [];
      var arrSearch = [];

      angular.extend(obj, data);

      for (contactId in obj) {
        contact = obj[contactId];

        arr.push(contact);

        arrSearch.push({
          description: contact.email ? [contact.email] : [],
          label: contact.display_name,
          icon_class: contact.contact_type,
          id: contact.contact_id
        });
      }

      arr = $filter('orderBy')(arr, 'sort_name');
      arrSearch = $filter('orderBy')(arrSearch, 'label');

      $rootScope.cache.contact = {
        arr: arr,
        obj: obj,
        arrSearch: arrSearch
      };
    }
  }

  return { contactService: contactService };
});
