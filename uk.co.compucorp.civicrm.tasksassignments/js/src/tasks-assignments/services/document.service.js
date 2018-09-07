/* eslint-env amd */

define([
  'common/angular',
  'common/lodash'
], function (angular, _) {
  'use strict';

  documentService.$inject = [
    'Document', '$q', 'config', 'settings', 'utilsService', 'contactService',
    'assignmentService', '$log'
  ];

  function documentService (Document, $q, config, settings, utilsService,
    contactService, assignmentService, $log) {
    $log.debug('Service: documentService');

    return {
      assign: assign,
      cacheContactsAndAssignments: cacheContactsAndAssignments,
      delete: deleteDocument,
      get: get,
      getOptions: getOptions,
      getDocumentStatus: getDocumentStatus,
      getDocumentTypes: getDocumentTypes,
      save: save,
      saveMultiple: saveMultiple,
      sendReminder: sendReminder
    };

    function assign (documentArr, assignmentId) {
      if ((!documentArr || !angular.isArray(documentArr)) ||
      (!assignmentId || typeof +assignmentId !== 'number')) {
        return null;
      }

      if (!documentArr.length) {
        return documentArr;
      }

      var deferred = $q.defer();

      Document.save({ action: 'copy_to_assignment' }, {
        json: {
          id: documentArr,
          case_id: assignmentId
        } || {}
      }, function (data) {
        if (utilsService.errorHandler(data, 'Unable to assign documents', deferred)) {
          return;
        }

        deferred.resolve(data.values);
      }, function () {
        deferred.reject('Unable to assign documents');
      });

      return deferred.promise;
    }

    /**
     * Form the available documents, takes contact ids and assignment ids
     * then fetches respective contacts and addignments and caches them.
     *
     * @param  {array} documents
     * @param  {Array} options Possible values ['contacts','assignments']
     */
    function cacheContactsAndAssignments (documents, options) {
      var contactIds = [];
      var assignmentIds = [];
      var contactPromise;
      var assignmentsPromise;

      // IE Fix
      if (options === undefined) {
        options = ['contacts', 'assignments'];
      }

      options = Array.isArray(options) ? options : [options];

      if (_.includes(options, 'contacts')) {
        contactIds = collectContactIds(documents);
        config.CONTACT_ID && contactIds.push(config.CONTACT_ID);
        if (contactIds && contactIds.length) {
          contactPromise = contactService.get({
            'IN': contactIds
          }).then(function (data) {
            contactService.updateCache(data);
          });
        } else {
          contactPromise = $q.resolve();
        }
      }

      if (_.includes(options, 'assignments')) {
        assignmentIds = collectAssignmentIds(documents);
        if (assignmentIds && assignmentIds.length && settings.extEnabled.assignments) {
          assignmentsPromise = assignmentService.get({
            'IN': assignmentIds
          }).then(function (data) {
            assignmentService.updateCache(data);
          });
        } else {
          assignmentsPromise = $q.resolve();
        }
      }

      return $q.all([
        contactPromise,
        assignmentsPromise
      ]);
    }

    /**
     * Makes collection of contact ids form list of documents
     * @param  {array} documents
     * @return {array}
     */
    function collectContactIds (documents) {
      return _(documents).map(function (document) {
        var contactIds = [];

        contactIds.push(document.source_contact_id);

        if (document.assignee_contact_id && document.assignee_contact_id.length) {
          contactIds = contactIds.concat(document.assignee_contact_id);
        }

        if (document.target_contact_id && document.target_contact_id.length) {
          contactIds.push(document.target_contact_id[0]);
        }

        return contactIds;
      }).flatten().value();
    }

    /**
     * Makes collection of assignment ids form list of documents
     * @param  {array} documents
     * @return {array}
     */
    function collectAssignmentIds (documents) {
      return documents.filter(function (document) {
        return !!document.case_id;
      })
        .map(function (document) {
          return document.case_id;
        });
    }

    function deleteDocument (documentId) {
      if (!documentId || typeof +documentId !== 'number') {
        return null;
      }

      var deferred = $q.defer();

      Document.delete({
        action: 'delete',
        json: { id: documentId }
      }, function (data) {
        deferred.resolve(data);
      }, function () {
        deferred.reject('Could not delete document ID: ' + documentId);
      });

      return deferred.promise;
    }

    function get (params) {
      var deferred = $q.defer();

      params = params && typeof params === 'object' ? params : {};

      params = angular.extend({
        'component': 'CiviDocument',
        'options': {
          'limit': 0
        },
        'is_current_revision': '1',
        'is_deleted': '0',
        'sequential': '1',
        'return': 'activity_date_time, activity_type_id, assignee_contact_id, details, id, source_contact_id, target_contact_id, subject, status_id, expire_date'
      }, params);

      Document.get({json: params}, function (data) {
        deferred.resolve(data.values);
      }, function () {
        deferred.reject('Unable to fetch documents list');
      });

      return deferred.promise;
    }

    function getDocumentStatus () {
      var deferredDocumentStatus = $q.defer();
      var documentStatus = {
        arr: [],
        obj: {}
      };

      Document.get({
        action: 'getoptions',
        json: {
          'field': 'status_id'
        }
      }, function (data) {
        _.each(data.values, function (option) {
          documentStatus.arr.push({
            key: option.key.toString(),
            value: option.value
          });

          documentStatus.obj[option.key] = option.value;
        });

        deferredDocumentStatus.resolve(documentStatus);
      });

      return deferredDocumentStatus.promise;
    }

    function getDocumentTypes () {
      var deferredDocumentType = $q.defer();
      var documentType = {
        arr: [],
        obj: {}
      };

      Document.get({
        action: 'getoptions',
        json: {
          'field': 'activity_type_id',
          'options': {
            'limit': 0
          }
        }
      }, function (data) {
        _.each(data.values, function (option) {
          documentType.arr.push({
            key: option.key,
            value: option.value
          });

          documentType.obj[option.key] = option.value;
        });

        deferredDocumentType.resolve(documentType);
      });

      return deferredDocumentType.promise;
    }

    function getOptions () {
      return $q.all({
        documentType: this.getDocumentTypes(),
        documentStatus: this.getDocumentStatus()
      });
    }

    function save (document) {
      if (!document || typeof document !== 'object') {
        return null;
      }

      var deferred = $q.defer();
      var params = angular.extend({
        sequential: 1,
        debug: config.DEBUG
      }, document);
      var val;

      Document.save({ action: 'create' }, {
        json: params || {}
      }, function (data) {
        if (utilsService.errorHandler(data, 'Unable to save document', deferred)) {
          return;
        }

        val = data.values;
        deferred.resolve(val.length === 1 ? val[0] : null);
      }, function () {
        deferred.reject('Unable to save document');
      });

      return deferred.promise;
    }

    function saveMultiple (documentArr) {
      if (!documentArr || !angular.isArray(documentArr)) {
        return null;
      }

      if (!documentArr.length) {
        return documentArr;
      }

      var deferred = $q.defer();

      Document.save({ action: 'create_multiple' }, {
        json: {
          document: documentArr
        } || {}
      }, function (data) {
        if (utilsService.errorHandler(data, 'Unable to save documents', deferred)) {
          return;
        }

        deferred.resolve(data.values);
      }, function () {
        deferred.reject('Unable to save documents');
      });

      return deferred.promise;
    }

    function sendReminder (documentId, notes) {
      if (!documentId || typeof +documentId !== 'number') {
        return null;
      }

      var deferred = $q.defer();

      Document.save({ action: 'sendreminder' }, {
        json: {
          activity_id: documentId,
          notes: notes || ''
        } || {}
      }, function (data) {
        if (utilsService.errorHandler(data, 'Unable to send a reminder', deferred)) {
          return;
        }

        deferred.resolve(data);
      }, function () {
        deferred.reject('Unable to send a reminder');
      });

      return deferred.promise;
    }
  }

  return { documentService: documentService };
});
