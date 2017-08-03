/* eslint-env amd */

define([
  'common/angular',
  'common/moment',
  'common/lodash',
  'tasks-assignments/controllers/controllers',
  'common/services/file.service',
  'common/services/notification.service',
  'tasks-assignments/services/contact',
  'tasks-assignments/services/dialog',
  'tasks-assignments/services/document',
  'tasks-assignments/services/file'
], function (angular, moment, _, controllers) {
  'use strict';

  controllers.controller('ModalDocumentCtrl', ['$window', '$scope', '$uibModalInstance', '$rootScope', '$rootElement', '$q', '$log', 'role',
    '$filter', '$uibModal', '$dialog', '$timeout', 'AssignmentService', 'DocumentService', 'ContactService', 'FileService', 'data',
    'files', 'config', 'HR_settings', 'modalMode', 'notificationService', 'fileService',
    function ($window, $scope, $modalInstance, $rootScope, $rootElement, $q, $log, role, $filter, $modal, $dialog, $timeout, AssignmentService,
      DocumentService, ContactService, FileService, data, files, config, HRSettings, modalMode, notificationService, fileService) {
      $log.debug('Controller: ModalDocumentCtrl');

      var vm = this;

      vm.document = {};
      vm.files = [];
      vm.filesTrash = [];
      vm.modalTitle = modalMode === 'edit' ? 'Edit Document' : 'New Document';
      vm.remindMeMessage = 'Checking this box sets a reminder that this document needs to be renewed a set number of days before the Expiry Date. You can set this by going <a target="_blank" href="/civicrm/tasksassignments/settings">here</a> CiviHR will do this by creating a copy of this document with the status ‘awaiting upload’, which you will be able to see in your Documents list.';
      vm.role = role || 'admin';
      vm.showCId = !config.CONTACT_ID;
      vm.uploader = FileService.uploader('civicrm_activity');
      vm.dpOpened = {
        due: false,
        exp: false,
        form: false
      };

      (function init () {
        angular.copy(data, vm.document);
        angular.copy(files, vm.files);
        vm.data = data;
        vm.document.activity_date_time = vm.document.activity_date_time ? moment(vm.document.activity_date_time).toDate() : null;
        vm.document.expire_date = vm.document.expire_date ? moment(vm.document.expire_date).toDate() : null;
        vm.document.assignee_contact_id = vm.document.assignee_contact_id || [];
        vm.document.source_contact_id = vm.document.source_contact_id || config.LOGGED_IN_CONTACT_ID;
        vm.document.status_id = vm.document.status_id || '1';
        vm.document.target_contact_id = vm.document.target_contact_id || [config.CONTACT_ID];
        vm.document.valid_from = vm.document.valid_from ? moment(vm.document.valid_from).toDate() : null;
        vm.assignments = $filter('filter')($rootScope.cache.assignment.arrSearch, function (val) {
          return +val.extra.contact_id === +vm.document.target_contact_id;
        });
        vm.contacts = {
          target: initialContacts('target'),
          assignee: initialContacts('assignee')
        };
      })();

      /**
       * Checks if the role is matched
       *
       * @param  {string}  role
       * @return {boolean}
       */
      vm.isRole = function (role) {
        return vm.role === role;
      };

      /**
       * Gets Document Type name for id
       *
       * @param  {int} documentTypeId
       * @return {string}
       */
      vm.getDocumentType = function (documentTypeId) {
        var documentType = _.find($rootScope.cache.documentType.arr, function (documentType) {
          return documentType.key === documentTypeId;
        });

        return documentType && documentType.value;
      };

      vm.statusFieldVisible = function () {
        return !!vm.document.status_id;
      };

      vm.showStatusField = function () {
        vm.document.status_id = 1;
      };

      vm.cacheAssignment = function ($item) {
        var obj = {};

        if (!$item || $rootScope.cache.assignment.obj[$item.id]) {
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

      /**
       * Searches the list of assignments for the given target contact
       *
       * @param  {string | integer} targetContactId
       */
      vm.searchContactAssignments = function (targetContactId) {
        return AssignmentService.search(null, null, targetContactId)
        .then(function (assignments) {
          vm.assignments = assignments;
          $rootScope.$broadcast('ct-spinner-hide');
        });
      };

      /**
       * Handler for target contact's change event
       *
       * @param  {object} selectedContact
       */
      vm.onContactChanged = function (selectedContact) {
        $rootScope.$broadcast('ct-spinner-show');
        vm.document.case_id = '';
        vm.cacheContact(selectedContact);
        vm.searchContactAssignments(selectedContact.id);
      };

      vm.cacheContact = function ($item) {
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

      vm.addAssignee = function ($item) {
        if (vm.document.assignee_contact_id.indexOf($item.id) === -1) {
          vm.document.assignee_contact_id.push($item.id);
        }

        vm.cacheContact($item);
      };

      vm.removeAssignee = function (index) {
        vm.document.assignee_contact_id.splice(index, 1);
      };

      vm.fileMoveToTrash = function (index) {
        vm.filesTrash.push(vm.files[index]);
        vm.files.splice(index, 1);
      };

      vm.refreshAssignments = function (input) {
        if (!input) {
          return;
        }

        var targetContactId = vm.document.target_contact_id;

        AssignmentService.search(input, vm.document.case_id).then(function (results) {
          vm.assignments = $filter('filter')(results, function (val) {
            return +val.extra.contact_id === +targetContactId;
          });
        });
      };

      vm.refreshContacts = function (input, type) {
        if (!input) {
          return;
        }

        ContactService.search(input, {
          contact_type: 'Individual'
        }).then(function (results) {
          vm.contacts[type] = results;
        });
      };

      vm.cancel = function () {
        if (vm.documentForm.$pristine && angular.equals(files, vm.files) && !vm.uploader.queue.length) {
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

      vm.confirm = function () {
        var doc = angular.copy(vm.document);

        if (!validateRequiredFields(doc)) {
          return;
        }

        if (angular.equals(data, doc) &&
          angular.equals(files, vm.files) && !vm.uploader.queue.length) {
          $modalInstance.dismiss('cancel');
          return;
        }

        var uploader = vm.uploader;
        var filesTrash = vm.filesTrash;
        var promiseFilesDelete = [];
        var file;

        $scope.$broadcast('ct-spinner-show');

        // temporary remove case_id
        +doc.case_id === +data.case_id && delete doc.case_id;
        doc.activity_date_time = vm.parseDate(doc.activity_date_time) || '';
        doc.expire_date = vm.parseDate(doc.expire_date);
        doc.status_id = !vm.isRole('admin') ? '2' : vm.document.status_id; // 2 => 'Awaiting Approval'

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
              vm.document.status_id = results.status_id;
              $modalInstance.close(vm.document);
            });
          } else if (result.files.length && !!result.files[0].values[0].result) {
            DocumentService.save({
              id: result.document.id,
              status_id: vm.isRole('admin') ? '3' : '1' // 3 => 'approved', 1 => 'awaiting upload'
            }).then(function (results) {
              vm.document.status_id = results.status_id;
              $modalInstance.close(vm.document);
            });
          } else {
            $modalInstance.close(vm.document);
          }

          vm.document.id = result.document.id;
          vm.document.case_id = result.document.case_id;
          vm.document.file_count = vm.files.length + uploader.queue.length;

          AssignmentService.updateTab();

          $rootScope.$broadcast('document-saved');
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
      vm.parseDate = function (date) {
        if (date instanceof Date) {
          date = date.getTime();
        }

        /**
         * Apart from date format fetched from CiviCRM settings we want to parse:
         *  - timestamps (Date object is used by some 3rd party directives)
         *  - date format we get from server
         */
        var formatted = moment(date, [HRSettings.DATE_FORMAT.toUpperCase(), 'x', 'YYYY-MM-DD']);

        return (formatted.isValid()) ? formatted.format('YYYY-MM-DD') : null;
      };

      vm.dpOpen = function ($event, name) {
        $event.preventDefault();
        $event.stopPropagation();
        vm.dpOpened[name] = true;
      };

      vm.dropzoneClick = function () {
        $timeout(function () {
          document.getElementById($rootScope.prefix + 'document-files').click();
        });
      };

      // Display help message
      vm.remindMeInfo = function () {
        CRM.help('Remind me?', vm.remindMeMessage, 'error');
      };

      /**
       * Open the given file and display the file in new tab
       * @param {object} file
       */
      vm.viewFile = function (file) {
        $rootScope.$broadcast('ct-spinner-show');
        fileService.openFile(file).then(function (blobFile) {
          $rootScope.$broadcast('ct-spinner-hide');
        });
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

        if (!doc.status_id) {
          missingRequiredFields.push('Status');
        }

        if (missingRequiredFields.length) {
          var notificationTitle = missingRequiredFields.length === 1 ? 'Required field' : 'Required fields';
          var missingFields = missingRequiredFields.join(', ');

          notificationService.alert(notificationTitle, missingFields, { expires: 5000 });

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
       * @return {array}
       */
      function initialContacts (type) {
        var cachedContacts = $rootScope.cache.contact.arrSearch;

        return !vm.document.id ? [] : cachedContacts.filter(function (contact) {
          var currContactId = vm.document[type + '_contact_id'][0];

          return +currContactId === +contact.id;
        });
      }
    }
  ]);
});
