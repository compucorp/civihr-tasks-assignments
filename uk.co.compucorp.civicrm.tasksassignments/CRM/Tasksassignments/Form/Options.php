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
  public function setDefaultValues() {
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

    CRM_Utils_System::setTitle('Add New Task / Document Type');

    $newOptions = array();

    if ($this->elementExists('component_id')) {
      $componentSelectElement = $this->getElement('component_id');
      $options = $componentSelectElement->_options;

      foreach ($options as $value) {
        $newOptions[$value['attr']['value']] = $value['text'];
      }
    }

    $civiTaskId = CRM_Core_Component::getComponentID('CiviTask');
    $civiDocumentId = CRM_Core_Component::getComponentID('CiviDocument');

    if ($civiTaskId !== NULL) {
      $newOptions[$civiTaskId] = t('Tasks');
    }

    if ($civiDocumentId !== NULL) {
      $newOptions[$civiDocumentId] = t('Documents');
    }

    $this->add('select',
      'component_id',
      ts('Category'),
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
  public static function formRule($fields, $files, $self) {
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
