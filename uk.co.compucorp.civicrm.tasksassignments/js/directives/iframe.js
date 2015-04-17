define(['directives/directives'], function(directives){
    directives.directive('taIframe',['$rootScope','$log','config', function($rootScope, $log, config){
        $log.debug('Directive: taIframe');

        return {
            link: function ($scope, el, attrs) {

                var hideElements = ['branding',
                                    'toolbar',
                                    'civicrm-menu',
                                    'civicrm-footer',
                                    'access'],
                    i = 0, len = hideElements.length;

                el[0].onload = function() {
                    var document = frames[attrs.name].document;

                    for (i; i < len; i++) {
                        document.getElementById(hideElements[i]).style.display = 'none';
                    }

                    document.getElementsByTagName('body')[0].style.paddingTop = '10px'

                }

            }
        }
    }]);
});