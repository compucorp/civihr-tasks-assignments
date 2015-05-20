{assign var="module" value="cividocuments" }
{assign var="prefix" value="ct-" }

<div id="{$module}">
    <div class="container" ng-view>
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
        document.dispatchEvent(new CustomEvent('taInit', {
            'detail': {
                'app': 'appDocuments',
                'module': 'cividocuments'
            }
        }));
    </script>
{/literal}