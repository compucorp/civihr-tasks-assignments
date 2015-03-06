{assign var="module" value="civitasks" }
{assign var="prefix" value="ct-" }

<div id="{$module}">
    <div class="container" ng-view>
    </div>
</div>
{literal}
    <script type="text/javascript">
        document.dispatchEvent(new CustomEvent('taLoad'));
    </script>
{/literal}