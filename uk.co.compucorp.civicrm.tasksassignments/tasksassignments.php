<?php

require_once 'tasksassignments.civix.php';

use \CRM_Utils_Array as ArrayHelper;
use \CRM_Tasksassignments_Wrapper_StripInvalidTaskTypesWrapper as StripInvalidTaskTypesWrapper;

/**
 * Implements hook_civicrm_config().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_config
 */
function tasksassignments_civicrm_config(&$config) {
  _tasksassignments_civix_civicrm_config($config);
}

/**
 * Implements hook_apiWrappers().
 *
 * @param array $wrappers
 * @param array $apiRequest
 */
function tasksassignments_civicrm_apiWrappers(&$wrappers, $apiRequest) {
  $requestJson = ArrayHelper::value('json', $_REQUEST);

  $entity = ArrayHelper::value('entity', $apiRequest);
  $action = ArrayHelper::value('action', $apiRequest);
  $params = ArrayHelper::value('params', $apiRequest, []);

  $optionGroup = ArrayHelper::value('option_group_id', $params);
  $isActivityType = $optionGroup === 'activity_type';

  $jsonFromCaseEdit = '"actTypes":["OptionValue","get",{"option_group_id":"activity_type","options":{"sort":"name","limit":0}}]';
  $isAssignmentEdit = strpos($requestJson, $jsonFromCaseEdit) !== FALSE;

  if ($isAssignmentEdit && $entity === 'OptionValue' && $action === 'get' && $isActivityType) {
    $wrappers[] = new StripInvalidTaskTypesWrapper();
  }
}

/**
 * Implements hook_civicrm_xmlMenu().
 *
 * @param array $files
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_xmlMenu
 */
function tasksassignments_civicrm_xmlMenu(&$files) {
  _tasksassignments_civix_civicrm_xmlMenu($files);
}

/**
 * Implements hook_civicrm_install().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_install
 */
function tasksassignments_civicrm_install() {
  _tasksassignments_civix_civicrm_install();
}

/**
 * Implements hook_civicrm_postInstall().
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_postInstall/
 */
function tasksassignments_civicrm_postInstall() {
  _taskassignments_saveDefaultSettings();
}

/**
 * Implements hook_civicrm_uninstall().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_uninstall
 */
function tasksassignments_civicrm_uninstall() {
  // PCHR-1263 : hrcase should not be installed/enabled without Task & Assignments extension
  if (tasksassignments_checkHrcase()) {
    tasksassignments_extensionsPageRedirect();
  }
  _tasksassignments_civix_civicrm_uninstall();
}

/**
 * Implements hook_civicrm_enable().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_enable
 */
function tasksassignments_civicrm_enable() {
  _tasksassignments_civix_civicrm_enable();
}

/**
 * Implements hook_civicrm_disable().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_disable
 */
function tasksassignments_civicrm_disable() {
  // PCHR-1263 : hrcase should not be installed/enabled without Task & Assignments extension
  if (tasksassignments_checkHrcase()) {
    tasksassignments_extensionsPageRedirect();
  }

  _tasksassignments_civix_civicrm_disable();
}

/**
 * Implements hook_civicrm_upgrade().
 *
 * @param $op string, the type of operation being performed; 'check' or 'enqueue'
 * @param $queue CRM_Queue_Queue, (for 'enqueue') the modifiable list of pending up upgrade tasks
 *
 * @return mixed  based on op. for 'check', returns array(boolean) (TRUE if upgrades are pending)
 *                for 'enqueue', returns void
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_upgrade
 */
function tasksassignments_civicrm_upgrade($op, CRM_Queue_Queue $queue = NULL) {
  return _tasksassignments_civix_civicrm_upgrade($op, $queue);
}

/**
 * Implements hook_civicrm_managed().
 *
 * Generate a list of entities to create/deactivate/delete when this module
 * is installed, disabled, uninstalled.
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_managed
 */
function tasksassignments_civicrm_managed(&$entities) {
  _tasksassignments_civix_civicrm_managed($entities);
}

/**
 * Implements hook_civicrm_caseTypes().
 *
 * Generate a list of case-types
 *
 * Note: This hook only runs in CiviCRM 4.4+.
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_caseTypes
 */
function tasksassignments_civicrm_caseTypes(&$caseTypes) {
  _tasksassignments_civix_civicrm_caseTypes($caseTypes);
}

/**
 * Implements hook_civicrm_alterSettingsFolders().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_alterSettingsFolders
 */
function tasksassignments_civicrm_alterSettingsFolders(&$metaDataFolders = NULL) {
  _tasksassignments_civix_civicrm_alterSettingsFolders($metaDataFolders);
}

function tasksassignments_civicrm_alterAPIPermissions($entity, $action, &$params, &$permissions) {
  $permissions['contact']['get'] = [];
  $permissions['contact']['getquick'] = [];

  $entitiesToAvoidPermissions = [
    'document',
    'task',
    'assignment',
    'activity',
    'case_type'
  ];

  if (in_array($entity, $entitiesToAvoidPermissions)) {
    $params['check_permissions'] = FALSE;
  }

  $permissions['setting']['get'] = ['access AJAX API'];
}

/**
 * Implements hook_civicrm_entityTypes().
 */
function tasksassignments_civicrm_entityTypes(&$entityTypes) {
  $entityTypes[] = array(
    'name' => 'Task',
    'class' => 'CRM_Tasksassignments_DAO_Task',
    'table' => 'civicrm_activity',
  );
  $entityTypes[] = array(
    'name' => 'Document',
    'class' => 'CRM_Tasksassignments_DAO_Document',
    'table' => 'civicrm_activity',
  );
  $entityTypes[] = array(
    'name' => 'Assignment',
    'class' => 'CRM_Tasksassignments_DAO_Assignment',
    'table' => 'civicrm_case',
  );
}

/**
 * Implements hook_civicrm_pageRun().
 *
 * @link https://docs.civicrm.org/dev/en/master/hooks/hook_civicrm_pageRun/
 */
function tasksassignments_civicrm_pageRun($page) {
  $resources = CRM_Core_Resources::singleton();
  $hooks = [
    new CRM_Tasksassignments_Hook_PageRun_CustomFieldIds($resources),
    new CRM_Tasksassignments_Hook_PageRun_Resources($resources),
  ];

  foreach ($hooks as $hook) {
    $hook->handle($page);
  }
}

/**
 * Implements hook_civicrm_tabset().
 *
 * Tasks and documents tabs should appear after Assignments tab directly
 * and since assignments tab weight is set to 30 we set both of those to
 * 40 and 50 respectively.
 *
 * @param string $tabsetName
 * @param array &$tabs
 * @param array $context
 */
function tasksassignments_civicrm_tabset($tabsetName, &$tabs, $context) {
  if ($tabsetName === 'civicrm/contact/view') {
    CRM_Tasksassignments_Page_Tasksassignments::registerScripts();
    if (CRM_Core_Permission::check('access Tasks and Assignments')) {
      $tabs[] = array(
        'id'        => 'civitasks',
        'url'       => CRM_Utils_System::url('civicrm/contact/view/tasks'),
        'title'     => ts('Tasks'),
        'weight'    => 40,
      );
      $documentsTab = civicrm_api3('TASettings', 'get', array(
        'fields' => 'documents_tab',
      ));
      if (!empty($documentsTab['values']['documents_tab']['value'])) {
        $tabs[] = array(
          'id'        => 'cividocuments',
          'url'       => CRM_Utils_System::url('civicrm/contact/view/documents'),
          'title'     => ts('Documents'),
          'weight'    => 50,
        );
      }
    }
  }
}

/**
 * Implements hook_civicrm_permission().
 *
 * @param array $permissions
 *
 * @return void
 */
function tasksassignments_civicrm_permission(&$permissions) {
  $prefix = ts('CiviTasksassignments') . ': ';
  $permissions += [
    'delete Tasks and Documents' => $prefix . ts('delete Tasks and Documents'),
    'access Tasks and Assignments' => $prefix . ts('access Tasks and Assignments'),
    'access Tasks and Assignments Files' => $prefix . ts('access Tasks and Assignments Files'),
  ];
}


/**
 * Implements the alterAngular hook so it can modify the template for the
 * Workflow Create/Edit screen.
 *
 * @param \Civi\Angular\Manager $angular
 *
 * @link https://docs.civicrm.org/dev/en/latest/framework/angular/changeset/
 */
function tasksAssignments_civicrm_alterAngular(\Civi\Angular\Manager $angular) {
  $changeSet = \Civi\Angular\ChangeSet::create('Workflow Modifications');

  $changeSet->alterHtml('~/crmCaseType/edit.html', function (phpQueryObject $doc) {
    _tasksAssignments_change_workflow_help_text($doc);
    _tasksAssignments_remove_non_civihr_tabs_from_workflow($doc);
    _tasksAssignments_allow_only_add_timeline_action($doc);
  });

  $changeSet->alterHtml('~/crmCaseType/timelineTable.html', function (phpQueryObject $doc) {
    _tasksAssignments_change_add_activity_dropdown_placeholder($doc);
    _tasksAssignments_change_column_text($doc);
    _tasksAssignments_remove_columns_from_timeline($doc);
  });

  $angular->add($changeSet);
}

function tasksAssignments_civicrm_angularModules(&$angularModules) {
  $angularModules['crm-tasks-workflows'] = [
    'ext' => 'civicrm',
    'js' => ['tools/extensions/civihr_tasks/uk.co.compucorp.civicrm.tasksassignments/js/dist/crm-tasks-workflows.min.js'],
  ];
}

/**
 * check if hrcase extension is installed or enabled
 *
 * @return int
 */
function tasksassignments_checkHrcase() {
  $isEnabled = CRM_Core_DAO::getFieldValue(
    'CRM_Core_DAO_Extension',
    'org.civicrm.hrcase',
    'is_active',
    'full_name'
  );
  return $isEnabled;
}

/**
 * redirect to extension list page and show error notification if hrcase is installed/enabled
 *
 */
function tasksassignments_extensionsPageRedirect() {
  $message = ts("You should disable/uninstall hrcase extension first");
  CRM_Core_Session::setStatus($message, ts('Cannot disable/uninstall extension'), 'error');
  $url = CRM_Utils_System::url(
    'civicrm/admin/extensions',
    http_build_query([
      'reset' => 1
    ])
  );
  CRM_Utils_System::redirect($url);
}

/**
 * Modifies the placeholder of Add Activity Dropdown
 *
 * @param phpQueryObject $doc
 */
function _tasksAssignments_change_add_activity_dropdown_placeholder(phpQueryObject $doc) {
  $addActivityDropDown = $doc->find('[crm-options=activityTypeOptions]');
  $newPlaceHolder = 'Add task or document';

  $addActivityDropDown->attr('placeholder', $newPlaceHolder);
}
/**
 * Modifies the help text for the Workflow Create/Edit screen.
 *
 * @param phpQueryObject $doc
 */
function _tasksAssignments_change_workflow_help_text(phpQueryObject $doc) {
  $helpBlock = $doc->find('.crmCaseType .help');

  $text = '<p>' . ts('Configure your workflow timelines below. Each workflow type can have several
    different task timelines. Each timeline allows you to set different tasks and documents which
    become part of your task list on your task dashboard. As such different timelines can be setup
    in the system if slightly different steps are required when the workflow is used for different
    staff types or situations. For example you may wish to configure a different joining timeline
    for head office staff as for regional staff.') . '</p>';
  $text .= '<p>' . ts('Workflows are normally used to manage joining and exiting processes but can
    be used for other processes too, such as a person going on maternity leave or moving region or
    location.') . '</p>';

  $helpBlock->html($text);
  // Places the help text outside of the case type form:
  $helpBlock->insertBefore('.crmCaseType');
}

/**
 * Removes tabs that are not relevant for CiviHR from the workflow configuration screen.
 *
 * @param phpQueryObject $doc
 */
function _tasksAssignments_remove_non_civihr_tabs_from_workflow(phpQueryObject $doc) {
  $tabs = ['roles', 'statuses', 'actType'];

  foreach ($tabs as $tab) {
    $doc->find('a[href=#acttab-' . $tab . ']')->remove();
    $doc->find('#acttab-' . $tab)->remove();
  }
}

/**
 * Removes the Workflow configuration's actions dropdown and replaces it with a
 * button that only allows the "Add timeline" action.
 *
 * @param phpQueryObject $doc
 */
function _tasksAssignments_allow_only_add_timeline_action(phpQueryObject $doc) {
  $actionDropdown = $doc->find('select[ng-model="newActivitySetWorkflow"]');
  $addTimelineBtn = '
    <button class="btn btn-secondary pull-right"
      ng-show="isNewActivitySetAllowed(\'timeline\')"
      ng-click="addActivitySet(\'timeline\')">
      Add timeline
    </button>';

  $actionDropdown->after($addTimelineBtn);
  $actionDropdown->remove();
}

/**
 * Remove columns from timeline
 *
 * @param phpQueryObject $doc
 */
function _tasksAssignments_remove_columns_from_timeline(phpQueryObject $doc) {
  $columnsToBeRemovedFromTimeline = [ 'Status', 'Reference', 'Select' ];

  foreach ($columnsToBeRemovedFromTimeline as $columnName) {
    _tasksAssignments_remove_column($doc, $columnName);
  }
}

/**
 * Removes a column from a table by using the column's header name as a reference.
 *
 * @param phpQueryObject $doc
 * @param string $columnName
 */
function _tasksAssignments_remove_column(phpQueryObject $doc, $columnName) {
  $columnHeader = $doc->find('table th:contains("' . $columnName . '")');

  // skip if the column does not exist:
  if (!$columnHeader->count()) {
    return;
  }

  $columnIndex = $doc->find('table th')->index($columnHeader) + 1;
  $columnBody = $doc->find('table td:nth-child(' . $columnIndex . ')');

  $columnHeader->remove();
  $columnBody->remove();
}

/**
 * Change column text for timeline
 *
 * @param phpQueryObject $doc
 */
function _tasksAssignments_change_column_text(phpQueryObject $doc) {
  $doc->find('th:contains("Activity")')
    ->text('Task / Document Type');
}

/**
 * Sets the default values for the T&A Settings
 *
 * @throws \CiviCRM_API3_Exception
 */
function _taskassignments_saveDefaultSettings() {
  civicrm_api3('TASettings', 'set', [
    'fields' => [
      'documents_tab' => 1,
      'keydates_tab' => 1,
      'add_assignment_button_title' => '',
      'number_of_days' => 30,
      'auto_tasks_assigned_to' => '',
      'is_task_dashboard_default' => 1,
      'days_to_create_a_document_clone' => 90
    ]
  ]);
}
