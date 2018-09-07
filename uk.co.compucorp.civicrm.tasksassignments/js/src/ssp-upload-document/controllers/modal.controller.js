/* eslint-env amd */

define(function () {
  ModalController.$inject = [
    '$rootScope', '$window', '$rootElement', '$uibModal',
    'documentService', 'fileServiceTA', 'config', 'DateFormat'
  ];

  function ModalController ($rootScope, $window, $rootElement, $modal, documentService,
    fileService, config, DateFormat) {
    var vm = this;

    vm.modalDocument = modalDocument;

    (function init () {
      // Sets the date format for HR_settings.DATE_FORMAT
      DateFormat.getDateFormat();
      subscribeForEvents();
    })();

    /**
     * Collect required contact and cache them for document modal
     *
     * @return {promise}
     */
    function cacheContacts (documents) {
      return documentService.cacheContactsAndAssignments(documents, 'contacts');
    }

    /**
     * Gets Document for the given document id and
     * opens Modal with retrived document data
     *
     * @param {integer} id
     * @param {string} role
     * @param {string} mode
     */
    function modalDocument (id, role, mode) {
      documentService.get({ id: id })
        .then(function (data) {
          return {
            data: data,
            isOpened: openModalDocument(data[0], role, mode)
          };
        })
        .then(function (result) {
          return cacheContacts(result.data);
        })
        .then(function () {
          $rootScope.isLoading = false;
        })
        .catch(function (reason) {
          CRM.alert(reason, 'Error', 'error');
        });
    }

    /**
     * Opens Document Modal
     *
     * @param {object} data
     * @param {string} role
     * @param {string} mode
     * @param {promise}
     */
    function openModalDocument (data, role, mode) {
      var modalInstance = $modal.open({
        appendTo: $rootElement,
        controller: 'ModalDocumentController',
        controllerAs: 'documentModal',
        templateUrl: config.baseUrl + 'js/src/tasks-assignments/controllers/modal/modal-document.html',
        resolve: {
          modalMode: function () {
            return mode;
          },
          role: function () {
            return role;
          },
          data: function () {
            return data;
          },
          files: function () {
            if (!data.id || !+data.file_count) {
              return [];
            }

            return fileService.get(data.id, 'civicrm_activity');
          }
        }
      });

      return modalInstance.opened.then(function () {
        $rootScope.isLoading = true;
      });
    }

    /**
    * All event subscribers
    */
    function subscribeForEvents () {
      $rootScope.$on('document-saved', function () {
        $window.location.reload();
      });
    }
  }

  return { ModalController: ModalController };
});
