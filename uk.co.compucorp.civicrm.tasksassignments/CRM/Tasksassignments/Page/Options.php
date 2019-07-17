<?php

require_once 'CRM/Core/Page.php';

class CRM_Tasksassignments_Page_Options extends CRM_Admin_Page_Options {

  /**
   * Browse all options.
   */
  public function browse() {
    parent::browse();

    $optionValues = $this->get_template_vars('rows');
    $optionValues = array_filter($optionValues, function ($item) {
      return $item['is_reserved'] == 0;
    });

    $this->assign('rows', $optionValues);
  }

  /**
   * Use the form name to create the tpl file name
   *
   * @return string
   * @access public
   */
  public function getTemplateFileName() {
    return str_replace('_',
      DIRECTORY_SEPARATOR,
      'CRM_Admin_Page_Options'
    ) . '.tpl';
  }

  public function editForm() {
    //return self::$_gName ? 'CRM_Admin_Form_Options' : 'CRM_Admin_Form_OptionGroup';
    if (self::$_gName === 'activity_type') {
      return 'CRM_Tasksassignments_Form_Options';
    }
    return 'CRM_Admin_Form_OptionGroup';
  }
}
