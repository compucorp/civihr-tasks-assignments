/* eslint-env amd */

define(function () {
  'use strict';

  utilsService.$inject = ['$log'];

  function utilsService ($log) {
    $log.debug('Service: utilsService');
    return {
      errorHandler: errorHandler
    };

    function errorHandler (data, msg, deferred) {
      var errorCode = '';
      var errorMsg = msg || 'Unknown Error';

      if (data.is_error) {
        errorCode = data.error_code || errorCode;
        errorMsg = data.error_message || errorMsg;

        $log.error(errorCode + '\n' + errorMsg);

        if (deferred) {
          deferred.reject(errorCode + '\n' + errorMsg);
        }

        if (data.trace) {
          $log.error(data.trace);
        }
        return true;
      }

      if (!data.values) {
        $log.error(errorMsg);

        if (deferred) {
          deferred.reject(errorMsg);
        }
        return true;
      }
    }
  }

  return { utilsService: utilsService };
});
