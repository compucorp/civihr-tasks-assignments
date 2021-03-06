/* eslint-env amd */

define([
  'common/angular',
  'common/lodash'
], function (angular, _) {
  'use strict';

  assignmentService.$inject = [
    'Relationship', 'Assignment', 'AssignmentSearch', 'AssignmentType', '$q',
    'config', 'utilsService', '$filter', '$location', '$state', '$rootScope', '$log'
  ];

  function assignmentService (Relationship, Assignment, AssignmentSearch, AssignmentType,
    $q, config, utilsService, $filter, $location, $state, $rootScope, $log) {
    $log.debug('Service: assignmentService');

    return {
      get: get,
      assignCoordinator: assignCoordinator,
      getTypes: getTypes,
      save: save,
      search: search,
      updateCache: updateCache,
      updateTab: updateTab
    };

    function assignCoordinator (contactId, assignmentId) {
      if ((!contactId || typeof +contactId !== 'number') ||
        (!assignmentId || typeof +assignmentId !== 'number')) {
        return null;
      }

      var deferred = $q.defer();

      Relationship.save({
        action: 'create',
        json: {
          sequential: 1,
          contact_id_a: contactId,
          contact_id_b: config.LOGGED_IN_CONTACT_ID,
          relationship_type_id: 9,
          case_id: assignmentId
        }
      }, null, function (data) {
        if (utilsService.errorHandler(data, 'Unable to assign coordinator', deferred)) {
          return;
        }

        deferred.resolve(data.values);
      }, function () {
        deferred.reject('Unable to assign coordinator');
      });

      return deferred.promise;
    }

    function get (id) {
      if (!id || (typeof +id !== 'number' && typeof id !== 'object')) {
        return null;
      }

      var deferred = $q.defer();

      Assignment.get({
        'json': {
          'options': {
            'limit': 0
          },
          'id': id,
          'return': [
            'case_type_id',
            'contacts',
            'client_id',
            'contact_id',
            'id',
            'is_deleted',
            'start_date',
            'status_id',
            'subject'
          ],
          'debug': config.DEBUG
        }
      }, function (data) {
        if (utilsService.errorHandler(data, 'Unable to fetch assignments', deferred)) {
          return;
        }

        deferred.resolve(data.values);
      }, function () {
        deferred.reject('Unable to fetch assignments');
      });

      return deferred.promise;
    }

    function getTypes () {
      var deferred = $q.defer();

      AssignmentType.get({}, function (data) {
        if (utilsService.errorHandler(data, 'Unable to fetch assignment types', deferred)) {
          return;
        }

        deferred.resolve(data.values);
      }, function () {
        deferred.reject('Unable to fetch assignment types');
      });

      return deferred.promise;
    }

    function save (assignment) {
      if (!assignment || typeof assignment !== 'object') {
        return null;
      }

      var deferred = $q.defer();
      var params = angular.extend({
        sequential: 1,
        debug: config.DEBUG
      }, assignment);
      var val;

      Assignment.save({
        action: 'create',
        json: params
      }, null, function (data) {
        if (utilsService.errorHandler(data, 'Unable to save an assignment', deferred)) {
          return;
        }

        val = data.values;
        deferred.resolve(val.length === 1 ? val[0] : null);
      }, function () {
        deferred.reject('Unable to save an assignment');
      });

      return deferred.promise;
    }

    function search (input, excludeCaseId, includeContactIds) {
      includeContactIds = Array.isArray(includeContactIds) ? includeContactIds.join(',') : includeContactIds;

      return AssignmentSearch.query({
        sortName: input,
        excludeCaseIds: excludeCaseId,
        includeContactIds: includeContactIds
      }).$promise;
    }

    function updateTab (count) {
      if (document.getElementsByClassName('CRM_Case_Form_Search').length) {
        CRM.refreshParent('.CRM_Case_Form_Search');
        return;
      }

      if (document.getElementById('tab_case')) {
        CRM.tabHeader.updateCount('#tab_case', CRM.tabHeader.getCount('#tab_case') + (count || 0));
        return;
      }

      if ($location.path() === '/assignments') {
        $state.reload(true);
      }
    }

    function updateCache (data) {
      var assignment, assignmentId, assignmentType;
      var obj = $rootScope.cache.assignment.obj || {};
      var arr = [];
      var arrSearch = [];

      angular.extend(obj, data);

      for (assignmentId in obj) {
        assignment = obj[assignmentId];
        assignmentType = $rootScope.cache.assignmentType.obj[assignment.case_type_id].title;
        arr.push(assignment);

        arrSearch.push({
          label: assignment.contacts[0].sort_name + ' - ' + assignmentType + (assignment.end_date ? ' (closed)' : ''),
          label_class: +assignment.is_deleted || assignment.end_date ? 'strikethrough' : '',
          id: assignmentId,
          extra: {
            case_subject: assignment.subject,
            case_type: assignmentType,
            contact_id: assignment.contacts[0].contact_id,
            end_date: assignment.end_date,
            sort_name: assignment.contacts[0].sort_name,
            start_date: assignment.start_date
          }
        });
      }

      arr = $filter('orderBy')(arr, 'subject');
      arrSearch = $filter('orderBy')(arrSearch, 'label');

      $rootScope.cache.assignment = {
        arr: arr,
        obj: obj,
        arrSearch: arrSearch
      };
    }
  }

  return { assignmentService: assignmentService };
});
