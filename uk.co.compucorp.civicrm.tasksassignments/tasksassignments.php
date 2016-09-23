<?php

require_once 'tasksassignments.civix.php';

/**
 * Implementation of hook_civicrm_config
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_config
 */
function tasksassignments_civicrm_config(&$config) {
  _tasksassignments_civix_civicrm_config($config);
}

/**
 * Implementation of hook_civicrm_xmlMenu
 *
 * @param $files array(string)
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_xmlMenu
 */
function tasksassignments_civicrm_xmlMenu(&$files) {
  _tasksassignments_civix_civicrm_xmlMenu($files);
}

/**
 * Implementation of hook_civicrm_install
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_install
 */
function tasksassignments_civicrm_install() {
  _tasksassignments_civix_civicrm_install();
}

/**
 * Implementation of hook_civicrm_uninstall
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_uninstall
 */
function tasksassignments_civicrm_uninstall() {
  // PCHR-1263 : hrcase should not be installed/enabled without Task & Assignments extension
  if (tasksassignments_checkHrcase())  {
    tasksassignments_extensionsPageRedirect();
  }
  _tasksassignments_civix_civicrm_uninstall();
}

/**
 * Implementation of hook_civicrm_enable
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_enable
 */
function tasksassignments_civicrm_enable() {
  _tasksassignments_toggleMenuItems();
  _tasksassignments_toggleCaseMenuItems(false);

  CRM_Core_BAO_Navigation::resetNavigation();
  _tasksassignments_civix_civicrm_enable();
}

/**
 * Implementation of hook_civicrm_disable
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_disable
 */
function tasksassignments_civicrm_disable() {
  // PCHR-1263 : hrcase should not be installed/enabled without Task & Assignments extension
  if (tasksassignments_checkHrcase())  {
    tasksassignments_extensionsPageRedirect();
  }

  _tasksassignments_toggleMenuItems(false);
  _tasksassignments_toggleCaseMenuItems();

  CRM_Core_BAO_Navigation::resetNavigation();
  _tasksassignments_civix_civicrm_disable();
}

/**
 * Implementation of hook_civicrm_upgrade
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
 * Implementation of hook_civicrm_managed
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
 * Implementation of hook_civicrm_caseTypes
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
 * Implementation of hook_civicrm_alterSettingsFolders
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_alterSettingsFolders
 */
function tasksassignments_civicrm_alterSettingsFolders(&$metaDataFolders = NULL) {
  _tasksassignments_civix_civicrm_alterSettingsFolders($metaDataFolders);
}

function tasksassignments_civicrm_alterAPIPermissions($entity, $action, &$params, &$permissions)
{
    $permissions['contact']['get'] = array();
    $permissions['contact']['getquick'] = array();
  if ($entity == 'document' || $entity == 'task' || $entity == 'assignment') {
    $params['check_permissions'] = false;
  }
}

/**
 * Implementation of hook_civicrm_entityTypes
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
 * Implementation of hook_civicrm_pageRun
 */
function tasksassignments_civicrm_pageRun($page) {
  if ($page instanceof CRM_Tasksassignments_Page_Tasks ||
      $page instanceof CRM_Tasksassignments_Page_Documents ||
      $page instanceof CRM_Tasksassignments_Page_Dashboard ||
      $page instanceof CRM_Tasksassignments_Page_Settings) {

    CRM_Core_Resources::singleton()
      ->addScriptFile('uk.co.compucorp.civicrm.tasksassignments', CRM_Core_Config::singleton()->debug ? 'js/src/tasks-assignments.js' : 'js/dist/tasks-assignments.min.js',1010);
    CRM_Core_Resources::singleton()
      ->addStyleFile('uk.co.compucorp.civicrm.tasksassignments', 'css/civitasks.css');
  }
}

/**
 * Implementation of hook_civicrm_tabs
 * tasks and documents tabs should appear after assignments tab directly
 * and since assignments tab weight is
 * set to 30 we set both of those to
 * 40 & 50 respectively
 */

function tasksassignments_civicrm_tabs(&$tabs) {
  CRM_Tasksassignments_Page_Tasksassignments::registerScripts();

  if (CRM_Core_Permission::check('access Tasks and Assignments')) {
    $tabs[] = Array(
      'id'        => 'civitasks',
      'url'       => CRM_Utils_System::url('civicrm/contact/view/tasks'),
      'title'     => ts('Tasks'),
      'weight'    => 40
    );

    $documentsTab = civicrm_api3('TASettings', 'get', array(
      'fields' => 'documents_tab',
    ));

    if (!empty($documentsTab['values']['documents_tab']['value'])) {
      $tabs[] = Array(
        'id'        => 'cividocuments',
        'url'       => CRM_Utils_System::url('civicrm/contact/view/documents'),
        'title'     => ts('Documents'),
        'weight'    => 50
      );
    }
  }
}

/**
 * Implementation of hook_civicrm_permission
 *
 * @param array $permissions
 * @return void
 */
function tasksassignments_civicrm_permission(&$permissions) {
  $prefix = ts('CiviTasksassignments') . ': ';
  $permissions += array(
    'delete Tasks and Documents' => $prefix . ts('delete Tasks and Documents'),
    'access Tasks and Assignments' => $prefix . ts('access Tasks and Assignments'),
  );
}

/**
 * Sets the is_state flag of its own menu items
 *
 * @param boolean $activate
 * @return void
 */
function _tasksassignments_toggleMenuItems($activate = true) {
  $is_active = $activate ? 1 : 0;
  $sql = "UPDATE civicrm_navigation SET is_active=$is_active WHERE name IN ('tasksassignments', 'ta_dashboard', 'tasksassignments_administer', 'ta_settings')";

  CRM_Core_DAO::executeQuery($sql);
}

/**
 * Sets the is_state flag of the Case extension menu items
 *
 * @param boolean $activate
 * @return void
 */
function _tasksassignments_toggleCaseMenuItems($activate = true) {
  $is_active = $activate ? 1 : 0;
  $sql = "UPDATE civicrm_navigation SET is_active=$is_active WHERE name = 'Cases' AND parent_id IS NULL";

  CRM_Core_DAO::executeQuery($sql);
}

/**
 * check if hrcase extension is installed or enabled
 *
 * @return int
 */
function tasksassignments_checkHrcase()  {
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
function tasksassignments_extensionsPageRedirect()  {
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
