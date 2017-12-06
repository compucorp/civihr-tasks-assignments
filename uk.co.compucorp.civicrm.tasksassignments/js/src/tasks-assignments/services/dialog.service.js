/* eslint-env amd */

define(function () {
  'use strict';

  $dialog.__name = '$dialog';
  $dialog.$inject = ['$uibModal', 'config', '$rootElement', '$log'];

  function $dialog ($modal, config, $rootElement, $log) {
    $log.debug('Service: $dialog');

    return {
      open: function (options) {
        if (options && typeof options !== 'object') {
          return;
        }

        return $modal.open({
          appendTo: $rootElement.find('div').eq(0),
          templateUrl: config.path.TPL + 'modal/dialog.html',
          size: 'sm',
          controller: 'ModalDialogController',
          resolve: {
            content: function () {
              return {
                copyCancel: options.copyCancel || '',
                copyConfirm: options.copyConfirm || '',
                title: options.title || '',
                msg: options.msg || ''
              };
            }
          }
        }).result;
      }
    };
  }

  return $dialog;
});
