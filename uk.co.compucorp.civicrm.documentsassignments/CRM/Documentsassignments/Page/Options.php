<?php

require_once 'CRM/Core/Page.php';

class CRM_Documentsassignments_Page_Options extends CRM_Admin_Page_Options {
  
  function run() {
    parent::run();
  }
    
  /**
   * Use the form name to create the tpl file name
   *
   * @return string
   * @access public
   */
  function getTemplateFileName() {
    return str_replace('_',
      DIRECTORY_SEPARATOR,
      'CRM_Admin_Page_Options'
    ) . '.tpl';
  }
    
  function editForm() {
    //return self::$_gName ? 'CRM_Admin_Form_Options' : 'CRM_Admin_Form_OptionGroup';
    if (self::$_gName === 'activity_type') {
      return 'CRM_Documentsassignments_Form_Options';
    }
    return 'CRM_Admin_Form_OptionGroup';
  }
}
