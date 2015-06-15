<?php

require_once 'CRM/Core/Page.php';

class CRM_Tasksassignments_Page_Tasksassignments extends CRM_Core_Page {
  function run() {
    parent::run();
  }

  static function registerScripts() {

    static $loaded = FALSE;
    if ($loaded) {
      return;
    }
    $loaded = TRUE;
    
    CRM_Core_Resources::singleton()
      ->addSettingsFactory(function () {
      global $user;
      $settings = array();
      $config = CRM_Core_Config::singleton();
      $extensions = CRM_Core_PseudoConstant::getExtensions();
      $taSettings = civicrm_api3('TASettings', 'get');
      foreach ($taSettings['values'] as $key => $value) {
          $settings[$key] = $value['value'];
      }
      return array(
        'Tasksassignments' => array(
            'extensionPath' => CRM_Core_Resources::singleton()->getUrl('uk.co.compucorp.civicrm.tasksassignments'),
            'case_extension' => !empty($extensions['org.civicrm.hrcase']),
            'settings' => $settings,
            'permissions' => array(
                'delete_tasks_and_documents' => CRM_Core_Permission::check('delete Tasks and Documents'),
            ),
        ),
        'adminId' => CRM_Core_Session::getLoggedInContactID(),
        'contactId' => CRM_Utils_Request::retrieve('cid', 'Integer'),
        'debug' => $config->debug,
      );
    });

  }
}
