/* eslint-env amd */

define([
  'common/angular',
  'common/lodash',
  'tasks-assignments/services/services',
  'tasks-assignments/services/utils'
], function (angular, _, services) {
  'use strict';

  services.factory('Document', ['$resource', '$httpParamSerializer', 'config', '$log', function ($resource, $httpParamSerializer, config, $log) {
    $log.debug('Service: Document');

    return $resource(config.url.REST, {
      'action': 'get',
      'entity': 'Document',
      'sequential': 1,
      'debug': config.DEBUG
    }, {
      save: {
        method: 'POST',
        isArray: false,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        transformRequest: $httpParamSerializer
      }
    });
  }]);

  services.factory('DocumentService', ['Document', '$q', 'config', 'settings', 'UtilsService', 'ContactService', 'AssignmentService', '$log',
    function (Document, $q, config, settings, UtilsService, ContactService, AssignmentService, $log) {
      $log.debug('Service: DocumentService');

      return {
        assign: function (documentArr, assignmentId) {
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
            if (UtilsService.errorHandler(data, 'Unable to assign documents', deferred)) {
              return;
            }

            deferred.resolve(data.values);
          }, function () {
            deferred.reject('Unable to assign documents');
          });

          return deferred.promise;
        },
        get: function (params) {
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
        },
        getOptions: function () {
          return $q.all({
            documentType: this.getDocumentTypes(),
            documentStatus: this.getDocumentStatus()
          });
        },
        getDocumentStatus: function () {
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
        },
        getDocumentTypes: function () {
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
        },
        save: function (document) {
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
            if (UtilsService.errorHandler(data, 'Unable to save document', deferred)) {
              return;
            }

            val = data.values;
            deferred.resolve(val.length === 1 ? val[0] : null);
          }, function () {
            deferred.reject('Unable to save document');
          });

          return deferred.promise;
        },
        saveMultiple: function (documentArr) {
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
            if (UtilsService.errorHandler(data, 'Unable to save documents', deferred)) {
              return;
            }

            deferred.resolve(data.values);
          }, function () {
            deferred.reject('Unable to save documents');
          });

          return deferred.promise;
        },
        sendReminder: function (documentId, notes) {
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
            if (UtilsService.errorHandler(data, 'Unable to send a reminder', deferred)) {
              return;
            }

            deferred.resolve(data);
          }, function () {
            deferred.reject('Unable to send a reminder');
          });

          return deferred.promise;
        },
        delete: function (documentId) {
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
        },

        /**
         * Form the available documents, takes contact ids and assignment ids
         * then fetches respective contacts and addignments and caches them.
         *
         * @param  {array} documents
         * @param  {Array} options Possible values ['contacts','assignments']
         */
        cacheContactsAndAssignments: function (documents, options) {
          var contactIds = [];
          var assignmentIds = [];
          var contactPromise;
          var assignmentsPromise;

          // IE Fix
          if (options === undefined) {
            options = ['contacts', 'assignments'];
          }

          options = Array.isArray(options) ? options : [options];

          if (_.contains(options, 'contacts')) {
            contactIds = collectContactIds(documents);
            config.CONTACT_ID && contactIds.push(config.CONTACT_ID);
            if (contactIds && contactIds.length) {
              contactPromise = ContactService.get({
                'IN': contactIds
              }).then(function (data) {
                ContactService.updateCache(data);
              });
            } else {
              contactPromise = $q.resolve();
            }
          }

          if (_.contains(options, 'assignments')) {
            assignmentIds = collectAssignmentIds(documents);
            if (assignmentIds && assignmentIds.length && settings.extEnabled.assignments) {
              assignmentsPromise = AssignmentService.get({
                'IN': assignmentIds
              }).then(function (data) {
                AssignmentService.updateCache(data);
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
      };

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
            Array.prototype.push.apply(contactIds, document.assignee_contact_id);
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
    }
  ]);
});
