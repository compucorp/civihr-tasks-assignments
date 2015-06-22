{assign var="module" value="cividocuments" }
{assign var="prefix" value="ct-" }

<div id="{$module}" ng-controller="MainCtrl" ct-spinner ct-spinner-show>
    <div class="container fade-in" ng-view>
    </div>
</div>
{literal}
    <script type="text/javascript">
        /*
         var evt = document.createEvent("CustomEvent");
         document.dispatchEvent(new CustomEvent('taInit')) || evt.initCustomEvent('taInit', false, false, {
         'details': 'appContact'
         });
         */

        (function(){
            function taInit(){
                document.dispatchEvent(new CustomEvent('taInit', {
                    'detail': {
                        'app': 'appDocuments',
                        'module': 'cividocuments'
                    }
                }));
            };
            taInit();

            document.addEventListener('taReady', function(){
                taInit();
            });
        })();
    </script>
{/literal}