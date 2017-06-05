/* global define, CRM */

define([
  'common/angular',
  'common/moment',
  'tasks-assignments/controllers/controllers',
  'tasks-assignments/services/contact',
  'tasks-assignments/services/file',
  'tasks-assignments/services/dialog',
  'tasks-assignments/services/document'
], function (angular, moment, controllers) {
  'use strict';

  controllers.controller('ModalDocumentCtrl', ['$scope', '$uibModalInstance', '$rootScope', '$rootElement', '$q', '$log', 'role',
    '$filter', '$uibModal', '$dialog', '$timeout', 'AssignmentService', 'DocumentService', 'ContactService', 'FileService', 'data', 'files', 'config', 'HR_settings',
    function ($scope, $modalInstance, $rootScope, $rootElement, $q, $log, role, $filter, $modal, $dialog, $timeout, AssignmentService,
      DocumentService, ContactService, FileService, data, files, config, HR_settings) {
      $log.debug('Controller: ModalDocumentCtrl');

      // Init call
      (function init () {
        $scope.files = [];
        $scope.document = {};

        angular.copy(data, $scope.document);
        angular.copy(files, $scope.files);

        $scope.data = data;
        $scope.role = role || 'admin';

        $scope.document.activity_date_time = $scope.document.activity_date_time ? moment($scope.document.activity_date_time).toDate() : null;
        $scope.document.expire_date = $scope.document.expire_date ? moment($scope.document.expire_date).toDate() : null;
        $scope.document.valid_from = $scope.document.valid_from ? moment($scope.document.valid_from).toDate() : null;
        $scope.document.assignee_contact_id = $scope.document.assignee_contact_id || [];
        $scope.document.source_contact_id = $scope.document.source_contact_id || config.LOGGED_IN_CONTACT_ID;
        $scope.document.target_contact_id = $scope.document.target_contact_id || [config.CONTACT_ID];
        $scope.document.status_id = $scope.document.status_id || '1';

        $scope.filesTrash = [];
        $scope.uploader = FileService.uploader('civicrm_activity');
        $scope.showCId = !config.CONTACT_ID;
        $scope.assignments = $filter('filter')($rootScope.cache.assignment.arrSearch, function (val) {
          return +val.extra.contact_id === +$scope.document.target_contact_id;
        });

        $scope.contacts = {
          target: initialContacts('target'),
          assignee: initialContacts('assignee')
        };

        $scope.dpOpened = {
          due: false,
          exp: false,
          form: false
        };

        $scope.remindMeMessage = 'If you check this box CiviHR will “remind” you that this document needs to be reviewed. CiviHR will do this by creating a copy of  the document with the  status of awaiting upload a number of days or months before the document expires. You can set the date to create the copy. The copy will have the same document  types and set the assignee to be the same assignee as for this original version of the document. You will then see it in your documents list and be able to action renewing the document.';
      })();

      /**
       * Checks if the role is matched
       *
       * @param  {string}  role
       * @return {boolean}
       */
      $scope.isRole = function (role) {
        return $scope.role === role;
      };

      $scope.statusFieldVisible = function () {
        return !!$scope.document.status_id;
      };

      $scope.showStatusField = function () {
        $scope.document.status_id = 1;
      };

      $scope.cacheAssignment = function ($item) {
        var obj = {};

        if ($rootScope.cache.assignment.obj[$item.id]) {
          return;
        }

        obj[$item.id] = {
          case_type_id: $filter('filter')($rootScope.cache.assignmentType.arr, {title: $item.extra.case_type})[0].id,
          client_id: {'1': $item.extra.contact_id},
          contact_id: {'1': $item.extra.contact_id},
          contacts: [{
            sort_name: $item.extra.sort_name,
            contact_id: $item.extra.contact_id
          }],
          end_date: $item.extra.end_date,
          id: $item.id,
          is_deleted: $item.label_class === 'strikethrough' ? '1' : '0',
          start_date: $item.extra.start_date,
          subject: $item.extra.case_subject
        };

        AssignmentService.updateCache(obj);
      };

      $scope.cacheContact = function ($item) {
        var obj = {};

        obj[$item.id] = {
          contact_id: $item.id,
          contact_type: $item.icon_class,
          sort_name: $item.label,
          display_name: $item.label,
          email: $item.description.length ? $item.description[0] : ''
        };

        ContactService.updateCache(obj);
      };

      $scope.addAssignee = function ($item) {
        if ($scope.document.assignee_contact_id.indexOf($item.id) === -1) {
          $scope.document.assignee_contact_id.push($item.id);
        }

        $scope.cacheContact($item);
      };

      $scope.removeAssignee = function (index) {
        $scope.document.assignee_contact_id.splice(index, 1);
      };

      $scope.fileMoveToTrash = function (index) {
        $scope.filesTrash.push($scope.files[index]);
        $scope.files.splice(index, 1);
      };

      $scope.refreshAssignments = function (input) {
        if (!input) {
          return;
        }

        var targetContactId = $scope.document.target_contact_id;

        AssignmentService.search(input, $scope.document.case_id).then(function (results) {
          $scope.assignments = $filter('filter')(results, function (val) {
            return +val.extra.contact_id === +targetContactId;
          });
        });
      };

      $scope.refreshContacts = function (input, type) {
        if (!input) {
          return;
        }

        ContactService.search(input, {
          contact_type: 'Individual'
        }).then(function (results) {
          $scope.contacts[type] = results;
        });
      };

      $scope.cancel = function () {
        if ($scope.documentForm.$pristine) {
          $modalInstance.dismiss('cancel');
          return;
        }

        $dialog.open({
          copyCancel: 'No',
          msg: 'Are you sure you want to cancel? Changes will be lost!'
        }).then(function (confirm) {
          if (!confirm) {
            return;
          }

          $scope.$broadcast('ct-spinner-hide');
          $modalInstance.dismiss('cancel');
        });
      };

      $scope.confirm = function () {
        var doc = angular.copy($scope.document);

        if (!validateRequiredFields(doc)) {
          return;
        }

        if (angular.equals(data, doc) &&
          angular.equals(files, $scope.files) && !$scope.uploader.queue.length) {
          $modalInstance.dismiss('cancel');
          return;
        }

        var uploader = $scope.uploader;
        var filesTrash = $scope.filesTrash;
        var promiseFilesDelete = [];
        var file;

        $scope.$broadcast('ct-spinner-show');

        // temporary remove case_id
        +doc.case_id === +data.case_id && delete doc.case_id;

        doc.activity_date_time = $scope.parseDate(doc.activity_date_time) || new Date();
        doc.expire_date = $scope.parseDate(doc.expire_date);

        if (filesTrash.length) {
          for (var i = 0; i < filesTrash.length; i++) {
            file = filesTrash[i];
            promiseFilesDelete.push(FileService.delete(file.fileID, file.entityID, file.entityTable));
          }
        }

        $q.all({
          document: DocumentService.save(doc),
          files: promiseFilesDelete.length ? $q.all(promiseFilesDelete) : []
        }).then(function (result) {
          if (uploader.queue.length) {
            var modalInstance = $modal.open({
              appendTo: $rootElement.find('div').eq(0),
              templateUrl: config.path.TPL + '/modal/progress.html?v=1',
              size: 'sm',
              controller: 'ModalProgressCtrl',
              resolve: {
                uploader: function () {
                  return uploader;
                },
                entityId: function () {
                  return result.document.id;
                }
              }
            });

            result.files = modalInstance.result;
            return $q.all(result);
          }

          return result;
        }).then(function (result) {
          if (result.files.length && !!result.files[0].result) {
            DocumentService.save({
              id: result.document.id,
              status_id: '1' // 1 => 'awaiting upload'
            }).then(function (results) {
              $scope.document.status_id = results.status_id;
              $modalInstance.close($scope.document);
            });
          } else if (result.files.length && !!result.files[0].values[0].result) {
            DocumentService.save({
              id: result.document.id,
              status_id: '3' // 3 => 'approved'
            }).then(function (results) {
              $scope.document.status_id = results.status_id;
              $modalInstance.close($scope.document);
            });
          } else {
            $modalInstance.close($scope.document);
          }

          $scope.document.id = result.document.id;
          $scope.document.case_id = result.document.case_id;
          $scope.document.file_count = $scope.files.length + uploader.queue.length;

          AssignmentService.updateTab();
          $scope.$broadcast('ta-spinner-hide');
        }, function (reason) {
          CRM.alert(reason, 'Error', 'error');
          $modalInstance.dismiss();
          $scope.$broadcast('ta-spinner-hide');

          return $q.reject();
        });
      };

      /**
       * Parse dates so they can be correctly read by server.
       *
       * @param {string|Date} date
       * @returns {string|null}
       */
      $scope.parseDate = function (date) {
        if (date instanceof Date) {
          date = date.getTime();
        }

        /**
         * Apart from date format fetched from CiviCRM settings we want to parse:
         *  - timestamps (Date object is used by some 3rd party directives)
         *  - date format we get from server
         */
        var formatted = moment(date, [HR_settings.DATE_FORMAT.toUpperCase(), 'x', 'YYYY-MM-DD']);

        return (formatted.isValid()) ? formatted.format('YYYY-MM-DD') : null;
      };

      $scope.dpOpen = function ($event, name) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.dpOpened[name] = true;
      };

      $scope.dropzoneClick = function () {
        $timeout(function () {
          document.getElementById($rootScope.prefix + 'document-files').click();
        });
      };

      // Display help message
      $scope.remindMeInfo = function () {
        CRM.help('Remind me?', $scope.remindMeMessage, 'error');
      };

      /**
       * Validates if the required fields values are present, and shows a notification if needed
       * @param  {Object} doc The document to validate
       * @return {boolean}     Whether the required field values are present
       */
      function validateRequiredFields (doc) {
        var missingRequiredFields = [];

        if (!doc.target_contact_id[0]) {
          missingRequiredFields.push('Contact');
        }

        if (!doc.activity_type_id) {
          missingRequiredFields.push('Document type');
        }

        if (!doc.status_id) {
          missingRequiredFields.push('Document status');
        }

        if (!doc.activity_date_time) {
          missingRequiredFields.push('Due Date');
        }

        if (!doc.status_id) {
          missingRequiredFields.push('Status');
        }

        if (missingRequiredFields.length) {
          var notification = CRM.alert(missingRequiredFields.join(', '),
            missingRequiredFields.length === 1 ? 'Required field' : 'Required fields', 'error');
          $timeout(function () {
            notification.close();
            notification = null;
          }, 5000);
          return false;
        }

        return true;
      }

      /**
       * The initial contacts that needs to be immediately available
       * in the lookup directive for the given type
       *
       * If the modal is for a brand new document, then the contacts list is empty
       *
       * @param {string} type - Either 'assignee' or 'target'
       * @return {Array}
       */
      function initialContacts (type) {
        var cachedContacts = $rootScope.cache.contact.arrSearch;

        return !$scope.document.id ? [] : cachedContacts.filter(function (contact) {
          var currContactId = $scope.document[type + '_contact_id'][0];

          return +currContactId === +contact.id;
        });
      }
    }
  ]);
});
