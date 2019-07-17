<?php

/**
 * This class overrides generated form components for Options
 *
 */
class CRM_Tasksassignments_Form_Options extends CRM_Admin_Form_Options {

  /**
   * Function to build the form
   *
   * @return void
   * @access public
   */
  public function buildQuickForm() {
    parent::buildQuickForm();

    $isNewOptionValue = empty($this->get('id'));

    if ($isNewOptionValue) {
      CRM_Utils_System::setTitle('Add New Task / Document Type');
    }
    else {
      CRM_Utils_System::setTitle('Edit Task / Document Type');
    }

    $categoryOptions = [];

    $civiTaskId = CRM_Core_Component::getComponentID('CiviTask');
    $civiDocumentId = CRM_Core_Component::getComponentID('CiviDocument');

    if ($civiTaskId !== NULL) {
      $categoryOptions[$civiTaskId] = t('Tasks');
    }

    if ($civiDocumentId !== NULL) {
      $categoryOptions[$civiDocumentId] = t('Documents');
    }

    $this->add('select',
      'component_id',
      ts('Category'),
      $categoryOptions, FALSE
    );

    Civi::resources()->addScriptFile('uk.co.compucorp.civicrm.tasksassignments', 'js/CRM/Form/Options.js');
  }
}
