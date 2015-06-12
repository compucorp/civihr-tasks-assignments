define(['directives/directives'], function(directives){
    directives.directive('taIframe',['$rootScope','$log', function($rootScope, $log){
        $log.debug('Directive: taIframe');

        return {
            link: function ($scope, el, attrs) {

                var iframeEl = el[0];

                iframeEl.addEventListener('load',function(){
                    var document = frames[attrs.name].document,
                        hideElements = ['branding',
                            'toolbar',
                            'civicrm-menu',
                            'civicrm-footer',
                            'access'],
                        i = 0, el2hide, len = hideElements.length;

                    for (i; i < len; i++) {
                        el2hide =  document.getElementById(hideElements[i]);
                        if (!el2hide) {
                            continue;
                        }
                        el2hide.style.display = 'none';
                    }

                    document.body.style.paddingTop = '10px';
                    iframeEl.height = document.body.scrollHeight+'px';
                    el.addClass('ct-iframe-ready');
                    $rootScope.$broadcast('iframe-ready');
                });

            }
        }
    }]);
});