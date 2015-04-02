<?php

require_once 'documentsassignments.civix.php';

/**
 * Implementation of hook_civicrm_config
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_config
 */
function documentsassignments_civicrm_config(&$config) {
  _documentsassignments_civix_civicrm_config($config);
}

/**
 * Implementation of hook_civicrm_xmlMenu
 *
 * @param $files array(string)
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_xmlMenu
 */
function documentsassignments_civicrm_xmlMenu(&$files) {
  _documentsassignments_civix_civicrm_xmlMenu($files);
}

/**
 * Implementation of hook_civicrm_install
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_install
 */
function documentsassignments_civicrm_install() {
  _documentsassignments_civix_civicrm_install();
}

/**
 * Implementation of hook_civicrm_uninstall
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_uninstall
 */
function documentsassignments_civicrm_uninstall() {
  _documentsassignments_civix_civicrm_uninstall();
}

/**
 * Implementation of hook_civicrm_enable
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_enable
 */
function documentsassignments_civicrm_enable() {
  _documentsassignments_civix_civicrm_enable();
}

/**
 * Implementation of hook_civicrm_disable
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_disable
 */
function documentsassignments_civicrm_disable() {
  _documentsassignments_civix_civicrm_disable();
}

/**
 * Implementation of hook_civicrm_upgrade
 *
 * @param $op string, the type of operation being performed; 'check' or 'enqueue'
 * @param $queue CRM_Queue_Queue, (for 'enqueue') the modifiable list of pending up upgrade documents
 *
 * @return mixed  based on op. for 'check', returns array(boolean) (TRUE if upgrades are pending)
 *                for 'enqueue', returns void
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_upgrade
 */
function documentsassignments_civicrm_upgrade($op, CRM_Queue_Queue $queue = NULL) {
  return _documentsassignments_civix_civicrm_upgrade($op, $queue);
}

/**
 * Implementation of hook_civicrm_managed
 *
 * Generate a list of entities to create/deactivate/delete when this module
 * is installed, disabled, uninstalled.
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_managed
 */
function documentsassignments_civicrm_managed(&$entities) {
  _documentsassignments_civix_civicrm_managed($entities);
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
function documentsassignments_civicrm_caseTypes(&$caseTypes) {
  _documentsassignments_civix_civicrm_caseTypes($caseTypes);
}

/**
 * Implementation of hook_civicrm_alterSettingsFolders
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_alterSettingsFolders
 */
function documentsassignments_civicrm_alterSettingsFolders(&$metaDataFolders = NULL) {
  _documentsassignments_civix_civicrm_alterSettingsFolders($metaDataFolders);
}

/**
 * Implementation of hook_civicrm_entityTypes
 */
function documentsassignments_civicrm_entityTypes(&$entityTypes) {
  $entityTypes[] = array(
    'name' => 'Document',
    'class' => 'CRM_Documentsassignments_DAO_Document',
    'table' => 'civicrm_activity',
  );
}

/**
 * Implementation of hook_civicrm_pageRun
 */
function documentsassignments_civicrm_pageRun($page) {
    if ($page instanceof CRM_Contact_Page_View_Summary) {

    }
}

/**
 * Implementation of hook_civicrm_tabs
 */

function documentsassignments_civicrm_tabs(&$tabs) {
    $tabs[] = Array(
        'id'        => 'cividocuments',
        'url'       => CRM_Utils_System::url('civicrm/contact/view/documents'),
        'title'     => ts('Documents'),
        'weight'    => 1
    );

    $tabs[] = Array(
        'id'        => 'civiassignments',
        'url'       => CRM_Utils_System::url('civicrm/contact/view/assignments'),
        'title'     => ts('Assignments'),
        'weight'    => 2
    );
}
