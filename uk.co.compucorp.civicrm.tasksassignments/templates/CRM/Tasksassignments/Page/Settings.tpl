{assign var="module" value="civitasks" }
{assign var="prefix" value="ct-" }

<div id="{$module}" class="{$prefix}page-loading" ng-controller="MainCtrl">
    <div class="container" ct-spinner ct-spinner-main-view>
        <div class="fade-in-up" ui-view>
            <div ct-spinner ct-spinner-main-view>
                <div class="{$prefix}container-inner fade-in-up" ui-view>

                </div>
            </div>
        </div>
    </div>
</div>
{literal}
    <script type="text/javascript">
        document.addEventListener('taReady', function(){
            document.dispatchEvent(new CustomEvent('taInit', {
                'detail': {
                    'app': 'appSettings',
                    'module': 'civitasks'
                }
            }));
        });
    </script>
{/literal}