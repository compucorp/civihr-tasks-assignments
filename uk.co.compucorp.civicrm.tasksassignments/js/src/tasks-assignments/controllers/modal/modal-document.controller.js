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

  controllers.controller('ModalDocumentController', ModalDocumentCtrl);

  ModalDocumentCtrl.$inject = ['$window', '$scope', '$uibModalInstance', '$rootScope',
    '$rootElement', '$q', '$log', 'role', '$filter', '$uibModal', '$dialog', '$timeout',
    'AssignmentService', 'DocumentService', 'ContactService', 'FileService', 'data',
    'files', 'config', 'HR_settings', 'modalMode', 'notificationService', 'fileService'
  ];

  function ModalDocumentCtrl ($window, $scope, $modalInstance, $rootScope, $rootElement,
    $q, $log, role, $filter, $modal, $dialog, $timeout, AssignmentService, DocumentService,
    ContactService, FileService, data, files, config, HRSettings, modalMode, notificationService, fileService) {
      $log.debug('Controller: ModalDocumentCtrl');

      var vm = this;

      vm.document = {};
      vm.files = [];
      vm.filesTrash = [];
      vm.mode = modalMode;
      vm.modalTitle = vm.mode === 'edit' ? 'Edit Document' : 'New Document';
      vm.containsFiles = true;
      vm.remindMeMessage = 'Checking this box sets a reminder that this document needs to be renewed a set number of days before the Expiry Date. You can set this by going <a target="_blank" href="/civicrm/tasksassignments/settings">here</a> CiviHR will do this by creating a copy of this document with the status ‘awaiting upload’, which you will be able to see in your Documents list.';
      vm.role = role || 'admin';
      vm.showCId = !config.CONTACT_ID;
      vm.uploader = FileService.uploader('civicrm_activity');
      vm.dpOpened = {
        due: false,
        exp: false,
        form: false
      };

      vm.addAssignee = addAssignee;
      vm.cacheAssignment = cacheAssignment;
      vm.cacheContact = cacheContact;
      vm.cancel = cancel;
      vm.confirm = confirm;
      vm.dpOpen = dpOpen;
      vm.dropzoneClick = dropzoneClick;
      vm.fileMoveToTrash = fileMoveToTrash;
      vm.getDocumentType = getDocumentType;
      vm.isRole = isRole;
      vm.onContactChanged = onContactChanged;
      vm.parseDate = parseDate;
      vm.removeAssignee = removeAssignee;
      vm.refreshAssignments = refreshAssignments;
      vm.refreshContacts = refreshContacts;
      vm.remindMeInfo = remindMeInfo;
      vm.statusFieldVisible = statusFieldVisible;
      vm.showStatusField = showStatusField;
      vm.searchContactAssignments = searchContactAssignments;
      vm.viewFile = viewFile;

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
      * Adds the given contact in the list of assignees
      * then cache it for later use
      *
      * @param {object} $item contact
      */
      function addAssignee ($item) {
        if (vm.document.assignee_contact_id.indexOf($item.id) === -1) {
          vm.document.assignee_contact_id.push($item.id);
        }

        vm.cacheContact($item);
      }

      /**
      * Caches the given assignment for later use
      *
      * @param  {object} $item Assignment
      */
      function cacheAssignment ($item) {
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
      }

      /**
       * Caches the given contact for later use
       *
       * @param  {object} $item contact
       */
      function cacheContact ($item) {
        var obj = {};

        obj[$item.id] = {
          contact_id: $item.id,
          contact_type: $item.icon_class,
          sort_name: $item.label,
          display_name: $item.label,
          email: $item.description.length ? $item.description[0] : ''
        };

        ContactService.updateCache(obj);
      }

      /**
       * Checks if the form is modified and
       * displays confirmation popup if form is changed
       * else dismisses the document modal
       */
      function cancel () {
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
      }

      /**
       * Saves/ Updates the document data
       */
      function confirm () {
        var doc = angular.copy(vm.document);

        if (!validateRequiredFields(doc)) {
          return;
        }

        if (angular.equals(data, doc) &&
          angular.equals(files, vm.files) && !vm.uploader.queue.length) {
          $modalInstance.dismiss('cancel');
          return;
        }

        var documentStatus = vm.document.status_id;
        var file;
        var promiseFilesDelete = [];

        if (vm.isRole('staff') && !vm.uploader.queue.length && !vm.files.length) {
          vm.containsFiles = false;
          return;
        }

        $scope.$broadcast('ct-spinner-show');

        documentStatus = vm.isRole('admin') ? '3' : (vm.files.length || vm.uploader.queue.length ? '2' : '1');

        // temporary remove case_id
        +doc.case_id === +data.case_id && delete doc.case_id;
        doc.activity_date_time = vm.parseDate(doc.activity_date_time) || '';
        doc.expire_date = vm.parseDate(doc.expire_date);
        doc.status_id = documentStatus;

        if (vm.filesTrash.length) {
          for (var i = 0; i < vm.filesTrash.length; i++) {
            file = vm.filesTrash[i];
            promiseFilesDelete.push(FileService.delete(file.fileID, file.entityID, file.entityTable));
          }
        }

        $q.all({
          document: DocumentService.save(doc),
          files: promiseFilesDelete.length ? $q.all(promiseFilesDelete) : []
        }).then(function (result) {
          if (vm.uploader.queue.length) {
            var modalInstance = $modal.open({
              appendTo: $rootElement.find('div').eq(0),
              templateUrl: config.path.TPL + '/modal/progress.html?v=1',
              size: 'sm',
              controller: 'ModalProgressCtrl',
              resolve: {
                uploader: function () {
                  return vm.uploader;
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
          vm.document.case_id = result.document.case_id;
          vm.document.file_count = vm.files.length + vm.uploader.queue.length;
          vm.document.id = result.document.id;
          vm.document.status_id = result.status_id;

          AssignmentService.updateTab();
          $modalInstance.close(vm.document);
          $rootScope.$broadcast('document-saved');
          $scope.$broadcast('ta-spinner-hide');
        }, function (reason) {
          CRM.alert(reason, 'Error', 'error');
          $modalInstance.dismiss();
          $scope.$broadcast('ta-spinner-hide');

          return $q.reject();
        });
      }

      /**
       * Prevents the default browser behaviourson the given element
       *
       * @param {object} $event
       * @param {string} name
       */
      function dpOpen ($event, name) {
        $event.preventDefault();
        $event.stopPropagation();
        vm.dpOpened[name] = true;
      }

      /**
       * Handler for when user clicks onthe dropzone field.
       */
      function dropzoneClick () {
        $timeout(function () {
          document.getElementById($rootScope.prefix + 'document-files').click();
        });
      }

      /**
       * Moves file to a trash array removing it form the files array
       *
       * @param  {integer} index
       */
      function fileMoveToTrash (index) {
        vm.filesTrash.push(vm.files[index]);
        vm.files.splice(index, 1);
      }

      /**
      * Gets Document Type name for id
      *
      * @param  {int} documentTypeId
      * @return {string}
      */
      function getDocumentType (documentTypeId) {
        var documentType = _.find($rootScope.cache.documentType.arr, function (documentType) {
          return documentType.key === documentTypeId;
        });

        return documentType && documentType.value;
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

        return !vm.document.id && modalMode === 'edit' ? [] : cachedContacts.filter(function (contact) {
          var currContactId = vm.document[type + '_contact_id'][0];

          return +currContactId === +contact.id;
        });
      }

      /**
       * Checks if the role is matched
       *
       * @param  {string}  role
       * @return {boolean}
       */
      function isRole (role) {
        return vm.role === role;
      }

      /**
      * Handler for target contact's change event
      *
      * @param  {object} selectedContact
      */
      function onContactChanged (selectedContact) {
        $rootScope.$broadcast('ct-spinner-show');
        vm.document.case_id = '';
        vm.cacheContact(selectedContact);
        vm.searchContactAssignments(selectedContact.id);
      }

      /**
      * Parse dates so they can be correctly read by server.
      *
      * @param {string|Date} date
      * @returns {string|null}
      */
      function parseDate (date) {
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
      }

      /**
      * Removes contact from the list of assignees ina document
      *
      * @param {integer}
      */
      function removeAssignee (index) {
        vm.document.assignee_contact_id.splice(index, 1);
      }

      /**
      * Searches the list of assignments based on the fiven input
      *
      * @param  {string} input
      */
      function refreshAssignments (input) {
        if (!input) {
          return;
        }

        var targetContactId = vm.document.target_contact_id;

        AssignmentService.search(input, vm.document.case_id).then(function (results) {
          vm.assignments = $filter('filter')(results, function (val) {
            return +val.extra.contact_id === +targetContactId;
          });
        });
      }

      /**
      * Searches list of contacts based on the contact name and contact type
      *
      * @param  {string} input
      * @param  {string} type
      */
      function refreshContacts (input, type) {
        if (!input) {
          return;
        }

        ContactService.search(input, {
          contact_type: 'Individual'
        }).then(function (results) {
          vm.contacts[type] = results;
        });
      }

      // Display help message
      function remindMeInfo () {
        CRM.help('Remind me?', vm.remindMeMessage, 'error');
      }

      /**
      * Searches the list of assignments for the given target contact
      *
      * @param  {string | integer} targetContactId
      * @return {promise}
      */
      function searchContactAssignments (targetContactId) {
        return AssignmentService.search(null, null, targetContactId)
        .then(function (assignments) {
          vm.assignments = assignments;
          $rootScope.$broadcast('ct-spinner-hide');
        });
      }

      /**
      * Assigns the status_id of a document
      */
      function showStatusField () {
        vm.document.status_id = 1;
      }

      /**
       * Toggles between the status of status field
       */
      function statusFieldVisible () {
        return !!vm.document.status_id;
      }

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
      * Open the given file and display the file in new tab
      * @param {object} file
      */
      function viewFile (file) {
        $rootScope.$broadcast('ct-spinner-show');
        fileService.openFile(file).then(function (blobFile) {
          $rootScope.$broadcast('ct-spinner-hide');
        });
      }
    };
});
