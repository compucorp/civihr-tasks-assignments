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
  _tasksassignments_civix_civicrm_uninstall();
}

/**
 * Implementation of hook_civicrm_enable
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_enable
 */
function tasksassignments_civicrm_enable() {
  _tasksassignments_civix_civicrm_enable();
}

/**
 * Implementation of hook_civicrm_disable
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_disable
 */
function tasksassignments_civicrm_disable() {
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

    if ($page instanceof CRM_Contact_Page_View_Summary || $page instanceof CRM_Tasksassignments_Page_Dashboard) {

        CRM_Core_Resources::singleton()
            ->addScriptFile('uk.co.compucorp.civicrm.tasksassignments', CRM_Core_Config::singleton()->debug ? 'js/ta-main.js' : 'dist/ta-main.js',1010);
        CRM_Core_Resources::singleton()
            ->addStyleFile('uk.co.compucorp.civicrm.tasksassignments', 'css/civitasks.css');

    }
}

/**
 * Implementation of hook_civicrm_tabs
 */

function tasksassignments_civicrm_tabs(&$tabs) {
    CRM_Tasksassignments_Page_Tasksassignments::registerScripts();
    
    $tabs[] = Array(
        'id'        => 'civitasks',
        'url'       => CRM_Utils_System::url('civicrm/contact/view/tasks'),
        'title'     => ts('Tasks'),
        'weight'    => 1
    );

    $documentsTab = civicrm_api3('TASettings', 'get', array(
        'fields' => 'documents_tab',
    ));
    if ($documentsTab['values']['documents_tab']['value']) {
        $tabs[] = Array(
            'id'        => 'cividocuments',
            'url'       => CRM_Utils_System::url('civicrm/contact/view/documents'),
            'title'     => ts('Documents'),
            'weight'    => 2
        );
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
