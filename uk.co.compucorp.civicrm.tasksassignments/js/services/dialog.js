define(['services/services'], function (services) {

    services.factory('$dialog', ['$modal', 'config', '$rootElement', '$log',
        function ($modal, config, $rootElement, $log) {
            $log.debug('Service: $dialog');

        return {
            open: function(options){

                if (options && typeof options !== 'object') {
                    return
                }

                return $modal.open({
                    targetDomEl: $rootElement.find('div').eq(0),
                    templateUrl: config.path.TPL+'modal/modalDialog.html',
                    size: 'sm',
                    controller: 'ModalDialogCtrl',
                    resolve: {
                        content: function(){
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
        }

    }]);

});