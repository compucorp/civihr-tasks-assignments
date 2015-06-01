define(['directives/directives'], function(directives){
    directives.directive('ctSpinner',['$rootScope','$log',function($rootScope, $log){
        $log.debug('Directive: ctSpinner');

        return {
            link: function ($scope, el, attrs) {
                var cover = document.createElement('div'),
                    positionSet = false,
                    spinner;

                cover.className = 'ct-spinner-cover ct-spinner-img';

                function isPositioned(){
                    var elPosition = window.getComputedStyle(el[0]).position;
                    return elPosition == 'relative' || elPosition == 'absolute' || elPosition == 'fixed'
                }

                function appendSpinner() {
                    if (!isPositioned()) {
                        el.css('position','relative');
                        positionSet = true;
                    }
                    el.append(cover);
                }

                function removeSpinner(){
                    cover.remove();
                    if (positionSet) {
                        el.css('position','');
                    }
                }

                if (typeof attrs.ctSpinnerShow !== 'undefined') {
                    appendSpinner();
                }

                if (typeof attrs.ngView !== 'undefined') {
                    cover.className = 'ct-spinner-cover';

                    spinner = document.createElement('div');
                    spinner.className = 'ct-spinner ct-spinner-img';

                    $rootScope.$on('$routeChangeStart', function() {
                        appendSpinner();
                        document.body.appendChild(spinner);
                    });

                    $rootScope.$on('$routeChangeSuccess', function() {
                        removeSpinner();
                        spinner.remove();
                    });

                    $rootScope.$on('routeChangeError', function() {
                        removeSpinner();
                        spinner.remove();
                    });

                }

                $scope.$on('ct-spinner-show',function(e, param){

                    if (!param || attrs.ctSpinnerId && attrs.ctSpinnerId == param) {
                        appendSpinner();
                        return
                    }

                });

                $scope.$on('ct-spinner-hide',function(e, param){

                    if (!param || attrs.ctSpinnerId && attrs.ctSpinnerId == param) {
                        removeSpinner();
                        return
                    }

                });

            }
        }
    }]);
});