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
        (function(){

            var detail = {
                'app': 'app-settings',
                'module': 'civitasks'
            };

            document.addEventListener('taReady', function(){
                document.dispatchEvent(typeof window.CustomEvent == "function" ? new CustomEvent('taInit', {
                    'detail': detail
                }) : (function(){
                    var e = document.createEvent('CustomEvent');
                    e.initCustomEvent('taInit', true, true, detail);
                    return e;
                })());
            });
        })();
    </script>
{/literal}
