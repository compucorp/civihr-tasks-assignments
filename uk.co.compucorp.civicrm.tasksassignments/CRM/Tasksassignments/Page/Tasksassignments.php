<?php

require_once 'CRM/Core/Page.php';

class CRM_Tasksassignments_Page_Tasksassignments extends CRM_Core_Page {
  function run() {
    if (!CRM_Core_Permission::check('access Tasks and Assignments')) {
        CRM_Core_Session::setStatus('Permission denied.', 'Tasks and Assignments', 'error');
        CRM_Utils_System::redirect('/civicrm');
        return FALSE;
    }
      
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
      if (!empty($settings['days_to_create_a_document_clone'])) {
        $settings['days_to_create_a_document_clone'] = (int)$settings['days_to_create_a_document_clone'];
      }
      return array(
        'Tasksassignments' => array(
            'extensionPath' => CRM_Core_Resources::singleton()->getUrl('uk.co.compucorp.civicrm.tasksassignments'),
            'case_extension' => !empty(CRM_Core_Component::get('CiviCase')),
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
