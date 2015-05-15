{assign var="module" value="civitasks" }
{assign var="prefix" value="ct-" }

<div id="{$module}" class="{$prefix}page-loading" ct-spinner  ct-spinner-show>
    <div class="container-fluid">
        <div id="{$prefix}dashboard">
            <div class="{$prefix}top-bar">
                <div class="row">
                    <div class="col-xs-12 col-sm-9">
                        <ol class="breadcrumb">
                            <li><a href="#">CiviHR</a></li>
                            <li class="active">Dashboard</li>
                        </ol>
                    </div>
                    <div class="col-xs-12 col-sm-3">
                        <div class="btn-group pull-right">
                            <a class="btn" ng-click="modalTask()">
                                <span class="fa fa-plus-circle" aria-hidden="true"></span> &nbsp;Add Task
                            </a>
                            <a class="btn" ng-click="modalAssignment()">
                                <span class="fa fa-plus-circle" aria-hidden="true"></span> &nbsp;Add Assignment
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="{$prefix}container-main">
                <ul class="nav {$prefix}sidebar {$prefix}sidebar-main" ng-controller="NavMainCtrl">
                    <li ng-class="{literal}{ active: isActive('/tasks')}{/literal}">
                        <a href="#/tasks">
                            <i class="fa fa-list"></i>
                            <span class="{$prefix}sidebar-main-title">Tasks</span>
                        </a>
                    </li>
                    <li ng-class="{literal}{ active: isActive('/documents')}{/literal}">
                        <a href="#/documents">
                            <i class="fa fa-files-o"></i>
                            <span class="{$prefix}sidebar-main-title">Documents</span>
                        </a>
                    </li>
                    <li ng-class="{literal}{ active: isActive('/assignments')}{/literal}">
                        <a href="#/assignments">
                            <i class="fa fa-briefcase"></i>
                            <span class="{$prefix}sidebar-main-title">Assignments</span>
                        </a>
                    </li>
                    <li ng-class="{literal}{ active: isActive('/calendar')}{/literal}">
                        <a href="#/calendar">
                            <i class="fa fa-calendar"></i>
                            <span class="{$prefix}sidebar-main-title">Calendar</span>
                        </a>
                    </li>
                    <li ng-class="{literal}{ active: isActive('/reports')}{/literal}">
                        <a href="#/reports">
                            <i class="fa fa-bar-chart"></i>
                            <span class="{$prefix}sidebar-main-title">Reports</span>
                        </a>
                    </li>
                    <li ng-class="{literal}{ active: isActive('/key-dates')}{/literal}">
                        <a href="#/key-dates">
                            <i class="fa fa-birthday-cake"></i>
                            <span class="{$prefix}sidebar-main-title">Key Dates</span>
                        </a>
                    </li>
                </ul>
                <div class="{$prefix}content-wrapper">
                    <div class="{$prefix}content">
                        <div class="{$prefix}container-inner fade-in-up"  ct-spinner ng-view>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
{literal}
    <script type="text/javascript">
        document.addEventListener('taReady', function(){
            document.dispatchEvent(new CustomEvent('taInit', {
                'detail': 'appDashboard'
            }));
        });
    </script>
{/literal}