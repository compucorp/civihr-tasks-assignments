{assign var="module" value="civitasks" }
{assign var="prefix" value="ct-" }

<div id="{$module}" class="{$prefix}page-loading" ng-controller="MainController">
  <div class="container-fluid">
    <div id="{$prefix}dashboard">
      <div class="{$prefix}top-bar" ng-controller="TopBarController">
        <div class="row">
          <div class="col-xs-12 col-sm-8">
            <ol class="breadcrumb">
              <li><a href="#">CiviHR</a></li>
              <li class="active">Dashboard</li>
            </ol>
          </div>
          <div class="col-xs-12 col-sm-4">
            <div class="btn-group pull-right">
              <a class="btn" ng-click="itemAdd.fn()">
                <span class="fa fa-plus-circle" aria-hidden="true"></span> &nbsp;
                {literal}{{itemAdd.label()}}{/literal}
              </a>
              <a class="btn" ng-click="modalAssignment()" ng-if="settings.extEnabled.assignments">
                <span class="fa fa-plus-circle" aria-hidden="true"></span> &nbsp;
                {literal}{{settings.copy.button.assignmentAdd || 'Add Workflow'}}{/literal}
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="{$prefix}container-main">
        <ul class="nav {$prefix}sidebar {$prefix}sidebar-main" ng-controller="NavMainController">
          <li ng-class="{literal}{ active: isActive('tasks')}{/literal}">
            <a href="#/tasks">
              <i class="fa fa-list"></i>
              <span class="{$prefix}sidebar-main-title">Tasks</span>
            </a>
          </li>
          <li ng-if="settings.tabEnabled.documents == '1'" ng-class="{literal}{ active: isActive('documents')}{/literal}">
            <a href="#/documents">
              <i class="fa fa-files-o"></i>
              <span class="{$prefix}sidebar-main-title">Documents</span>
            </a>
          </li>
          <li ng-class="{literal}{ active: isActive('calendar')}{/literal}">
            <a href="#/calendar">
              <i class="fa fa-calendar"></i>
              <span class="{$prefix}sidebar-main-title">Calendar</span>
            </a>
          </li>
          <li ng-if="settings.tabEnabled.keyDates == '1'" ng-class="{literal}{ active: isActive('keyDates')}{/literal}">
            <a href="#/key-dates">
              <i class="fa fa-birthday-cake"></i>
              <span class="{$prefix}sidebar-main-title">Key Dates</span>
            </a>
          </li>
        </ul>
        <div class="{$prefix}content-wrapper">
          <div class="{$prefix}content">
            <div ct-spinner ct-spinner-main-view>
              <div class="{$prefix}container-inner fade-in-up" ui-view></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
{literal}
  <script type="text/javascript">
    (function(){
      var detail = {
        'app': 'dashboard',
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
