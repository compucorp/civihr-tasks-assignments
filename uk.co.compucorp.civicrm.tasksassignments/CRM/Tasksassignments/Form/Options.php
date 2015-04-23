<?php

/**
 * This class overrides generated form components for Options
 *
 */
class CRM_Tasksassignments_Form_Options extends CRM_Admin_Form_Options {

  /**
   * The option group name
   *
   * @var array
   * @static
   */
  protected $_gName;

  /**
   * The option group name in display format (capitalized, without underscores...etc)
   *
   * @var array
   * @static
   */
  protected $_gLabel;

  /**
   * Function to pre-process
   *
   * @return void
   * @access public
   */
  public function preProcess() {
    parent::preProcess();
  }

  /**
   * This function sets the default values for the form.
   * the default values are retrieved from the database
   *
   * @access public
   *
   * @return void
   */
  function setDefaultValues() {
    $defaults = parent::setDefaultValues();
    return $defaults;
  }

  /**
   * Function to build the form
   *
   * @return void
   * @access public
   */
  public function buildQuickForm() {
    parent::buildQuickForm();
    
    $componentSelectElement = $this->getElement('component_id');
    $newOptions = array();
    $options = $componentSelectElement->_options;
    foreach ($options as $value) {
      $newOptions[$value['attr']['value']] = $value['text'];
    }
    
    /*$civiDocumentId = CRM_Core_Component::getComponentID('CiviDocument');
    if ($civiDocumentId !== null)
    {
        $newOptions[$civiDocumentId] = t('Documents and Assignments');
    }*/
    
    $civiTaskId = CRM_Core_Component::getComponentID('CiviTask');
    if ($civiTaskId !== null)
    {
        $newOptions[$civiTaskId] = t('Tasks and Assignments');
    }
    
    $this->add('select',
      'component_id',
      ts('Component'),
      $newOptions, FALSE
    );
    
    //$this->addFormRule(array('CRM_Admin_Form_Options', 'formRule'), $this);
  }

  /**
   * global form rule
   *
   * @param array $fields the input form values
   * @param array $files  the uploaded files if any
   * @param array $self   current form object.
   *
   * @return array array of errors / empty array.
   * @access public
   * @static
   */
  static function formRule($fields, $files, $self) {
    return parent::formRule($fields, $files, $self);
  }

  /**
   * Function to process the form
   *
   * @access public
   *
   * @return void
   */
  public function postProcess() {
    return parent::postProcess();
  }
}
