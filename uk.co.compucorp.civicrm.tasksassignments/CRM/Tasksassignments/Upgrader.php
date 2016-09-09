<?php

class CRM_Tasksassignments_Upgrader extends CRM_Tasksassignments_Upgrader_Base
{
    public function install() {

      // $this->executeCustomDataFile('xml/customdata.xml');
      $this->executeSqlFile('sql/install.sql');

      $revisions = $this->getRevisions();
      foreach ($revisions as $revision) {
          $methodName = 'upgrade_' . $revision;
          if (is_callable(array($this, $methodName))) {
            $this->{$methodName}();
          }
      }

    $this->setComponentStatuses(array(
      'CiviTask' => true,
      'CiviDocument' => true,
    ));
    }

  public function enable() {
    $this->setComponentStatuses(array(
      'CiviTask' => true,
      'CiviDocument' => true,
    ));
    return TRUE;
  }

  public function disable() {
    $this->setComponentStatuses(array(
      'CiviTask' => false,
      'CiviDocument' => false,
    ));
  }

  /**
   * Set components as enabled or disabled. Leave any other
   * components unmodified.
   *
   * Note: This API has only been tested with CiviCRM 4.4.
   *
   * @param array $components keys are component names (e.g. "CiviMail"); values are booleans
   */
  public function setComponentStatuses($components) {
    $getResult = civicrm_api3('setting', 'getsingle', array(
      'domain_id' => CRM_Core_Config::domainID(),
      'return' => array('enable_components'),
    ));
    if (!is_array($getResult['enable_components'])) {
      throw new CRM_Core_Exception("Failed to determine component statuses");
    }

    // Merge $components with existing list
    $enableComponents = $getResult['enable_components'];
    foreach ($components as $component => $status) {
      if ($status) {
        $enableComponents = array_merge($enableComponents, array($component));
      } else {
        $enableComponents = array_diff($enableComponents, array($component));
      }
    }
    civicrm_api3('setting', 'create', array(
      'domain_id' => CRM_Core_Config::domainID(),
      'enable_components' => array_unique($enableComponents),
    ));
    CRM_Core_Component::flushEnabledComponents();
  }

    public function upgrade_0001() {

          $optionGroupID = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_OptionGroup', 'task_status', 'id', 'name');
          if (!$optionGroupID) {
              $params = array(
                'name' => 'task_status',
                'title' => 'CiviTask Status',
                'is_active' => 1,
                'is_reserved' => 1,
              );
              civicrm_api3('OptionGroup', 'create', $params);
              $optionsValue = array(
                  1 => 'Task sample status 1',
                  2 => 'Task sample status 2',
                  3 => 'Task sample status 3',
              );
              foreach ($optionsValue as $key => $value) {
                $opValueParams = array(
                  'option_group_id' => 'task_status',
                  'name' => $value,
                  'label' => $value,
                  'value' => $key,
                );
                civicrm_api3('OptionValue', 'create', $opValueParams);
              }
          }

        return TRUE;
    }

    public function upgrade_0002() {
      // Add Tasks and Assignments to the Top Navigation menu
      CRM_Core_DAO::executeQuery("DELETE FROM `civicrm_navigation` WHERE name = 'tasksassignments' and parent_id IS NULL");

      $weight = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_Navigation', 'Contacts', 'weight', 'name');
      //$contactNavId = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_Navigation', 'Contacts', 'id', 'name');
      $importJobNavigation = new CRM_Core_DAO_Navigation();
      $params = array (
        'domain_id'  => CRM_Core_Config::domainID(),
        'label'      => ts('Tasks and Assignments'),
        'name'       => 'tasksassignments',
        'url'        => 'civicrm/tasksassignments/dashboard#/tasks',
        'parent_id'  => null,
        'weight'     => $weight+1,
        'permission' => 'access Tasks and Assignments',
        'separator'  => 1,
        'is_active'  => 1
      );
      $importJobNavigation->copyValues($params);
      $importJobNavigation->save();

      CRM_Core_BAO_Navigation::resetNavigation();

      return TRUE;
    }

    public function upgrade_0003() {
        // Remove custom 'task_status' option group / values and group four of default 'activity_status' values as 'resolved'.
        $taskStatuses = array('Completed', 'Cancelled', 'Not Required', 'No_show');

        $optionGroupID = (int)CRM_Core_DAO::getFieldValue('CRM_Core_DAO_OptionGroup', 'task_status', 'id', 'name');
        if ($optionGroupID) {
            CRM_Core_DAO::executeQuery("DELETE FROM `civicrm_option_value` WHERE option_group_id = {$optionGroupID}");
            CRM_Core_DAO::executeQuery("DELETE FROM `civicrm_option_group` WHERE id = {$optionGroupID}");
        }

        $optionGroupID = (int)CRM_Core_DAO::getFieldValue('CRM_Core_DAO_OptionGroup', 'activity_status', 'id', 'name');
        if ($optionGroupID) {
            $result = civicrm_api3('OptionValue', 'get', array(
                'sequential' => 1,
                'option_group_id' => $optionGroupID,
            ));
            foreach ($result['values'] as $value) {
                if (in_array($value['name'], $taskStatuses)) {
                    civicrm_api3('OptionValue', 'create', array(
                        'sequential' => 1,
                        'id' => $value['id'],
                        'grouping' => 'resolved',
                    ));
                }
            }
        }

        return TRUE;
    }

    /*
     * Install Task Types
     */
    public function upgrade_0004() {

      $this->_installActivityTypes('CiviTask', array(
        'Schedule joining date',
        'Probation appraisal (start probation workflow)',
        'Group Orientation to organization, values, policies',
        'Enter employee data in CiviHR',
        'Issue appointment letter',
        'Fill Employee Details Form',
        'Submission of ID/Residence proofs and photos',
        'Program and work induction by program supervisor',
        'Schedule Exit Interview',
        'Conduct Exit Interview',
        'Get "No Dues" certification',
        'Revoke Access to Database',
        'Block work email ID',
      ));

      return TRUE;
    }

    /*
     * Install Documents statuses
     */
    public function upgrade_0006() {

          $optionGroupID = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_OptionGroup', 'document_status', 'id', 'name');
          if (!$optionGroupID) {
              $params = array(
                'name' => 'document_status',
                'title' => 'CiviDocument Status',
                'is_active' => 1,
                'is_reserved' => 1,
              );
              civicrm_api3('OptionGroup', 'create', $params);
              $optionsValue = array(
                  1 => 'awaiting upload',
                  2 => 'awaiting approval',
                  3 => 'approved',
                  4 => 'rejected',
              );
              foreach ($optionsValue as $key => $value) {
                $opValueParams = array(
                  'option_group_id' => 'document_status',
                  'name' => $value,
                  'label' => $value,
                  'value' => $key,
                );
                civicrm_api3('OptionValue', 'create', $opValueParams);
              }
          }

        return TRUE;
    }

    /*
     * Install Tasks Assignments custom settings.
     */
    public function upgrade_0007() {

          $optionGroupID = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_OptionGroup', 'ta_settings', 'id', 'name');
          if (!$optionGroupID) {
              $params = array(
                'name' => 'ta_settings',
                'title' => 'Tasks and Assignments settings',
                'is_active' => 1,
                'is_reserved' => 1,
              );
              civicrm_api3('OptionGroup', 'create', $params);
              $optionsValue = array(
                  'documents_tab' => array(
                      'label' => 'Show or hide the Documents tab',
                      'value' => 1,
                  ),
                  'keydates_tab' => array(
                      'label' => 'Show or hide the Key Dates tab',
                      'value' => 1,
                  ),
                  'add_assignment_button_title' => array(
                      'label' => 'Configure \'Add Assignment\' button title',
                      'value' => '',
                  ),
                  'number_of_days' => array(
                      'label' => 'No of days prior to Key Date to create task',
                      'value' => 30,
                  ),
                  'auto_tasks_assigned_to' => array(
                      'label' => 'Auto generated Tasks assigned to',
                      'value' => '',
                  ),
              );
              foreach ($optionsValue as $key => $value) {
                $opValueParams = array(
                  'option_group_id' => 'ta_settings',
                  'name' => $key,
                  'label' => $value['label'],
                  'value' => $value['value'],
                );
                civicrm_api3('OptionValue', 'create', $opValueParams);
              }
          }

        return TRUE;
    }

    public function upgrade_0008()
    {
        $this->executeCustomDataFile('xml/activity_custom_fields.xml');

        return TRUE;
    }

    public function upgrade_0009()
    {
        $this->executeCustomDataFile('xml/probation.xml');

        return TRUE;
    }

    /*
     * Enable CiviTask and CiviDocument components.
     */
    /*public function upgrade_0010()
    {
        CRM_Core_BAO_ConfigSetting::enableComponent('CiviTask');
        CRM_Core_BAO_ConfigSetting::enableComponent('CiviDocument');

        return TRUE;
    }*/

    /*
     * Install Dummy Document Types (Activity Types)
     */
    public function upgrade_1011()
    {
      $this->_installActivityTypes('CiviDocument', array(
        'Joining Document 1',
        'Exiting document 1',
      ));

      return TRUE;
    }

    /*
     * Set up Daily Reminder job
     */
    public function upgrade_1012()
    {
        $dao = new CRM_Core_DAO_Job();
        $dao->api_entity = 'task';
        $dao->api_action = 'senddailyreminder';
        $dao->find(TRUE);
        if (!$dao->id)
        {
            $dao = new CRM_Core_DAO_Job();
            $dao->domain_id = CRM_Core_Config::domainID();
            $dao->run_frequency = 'Daily';
            $dao->parameters = null;
            $dao->name = 'Tasks and Assignments Daily Reminder';
            $dao->description = 'Tasks and Assignments Daily Reminder';
            $dao->api_entity = 'task';
            $dao->api_action = 'senddailyreminder';
            $dao->is_active = 0;
            $dao->save();
        }

        return TRUE;
    }

    /*
     * Add Settings page to Tasks and Assignments top menu
     */
    public function upgrade_1013()
    {
        $taNavigation = new CRM_Core_DAO_Navigation();
        $taNavigation->name = 'tasksassignments';
        $taNavigation->find(true);
        if ($taNavigation->id)
        {
            $taNavigation->url = '';
            $taNavigation->save();

            $submenu = array(
                array(
                    'label' => ts('Dashboard'),
                    'name' => 'ta_dashboard',
                    'url' => 'civicrm/tasksassignments/dashboard#/tasks',
                ),
                array(
                    'label' => ts('Settings'),
                    'name' => 'ta_settings',
                    'url' => 'civicrm/tasksassignments/settings',
                )
            );

            foreach ($submenu as $key => $item)
            {
                $item['parent_id'] = $taNavigation->id;
                $item['weight'] = $key;
                $item['is_active'] = 1;
                CRM_Core_BAO_Navigation::add($item);
            }

            CRM_Core_BAO_Navigation::resetNavigation();
        }

        return TRUE;
    }

    /*
     * Add Settings page to Administer top menu
     */
    public function upgrade_1014()
    {
        // Add Tasks and Assignments to the Administer menu
        $administerNavId = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_Navigation', 'Administer', 'id', 'name');
        if ($administerNavId)
        {
            CRM_Core_DAO::executeQuery("DELETE FROM `civicrm_navigation` WHERE name = 'tasksassignments_administer' and parent_id = %1",
                array(
                    1 => array($administerNavId, 'Integer'),
                )
            );

            $taAdminNavigation = new CRM_Core_DAO_Navigation();
            $params = array (
                'domain_id'  => CRM_Core_Config::domainID(),
                'label'      => ts('Tasks and Assignments'),
                'name'       => 'tasksassignments_administer',
                'url'        => null,
                'parent_id'  => $administerNavId,
                'separator'  => 1,
                'is_active'  => 1
            );
            $taAdminNavigation->copyValues($params);
            $taAdminNavigation->save();

            $taSettings = new CRM_Core_DAO_Navigation();
            $taSettings->name = 'ta_settings';
            $taSettings->find(true);
            if ($taSettings->id)
            {
                $taSettings->parent_id = $taAdminNavigation->id;
                $taSettings->save();
            }

            CRM_Core_BAO_Navigation::resetNavigation();
        }

        return TRUE;
    }

  public function upgrade_1015()
  {
    $setting = civicrm_api3('OptionValue', 'get', array(
      'option_group_id' => 'ta_settings',
      'name' => 'is_task_dashboard_default'
    ));

    if (empty($setting['id'])) {
      $opValueParams = array(
        'option_group_id' => 'ta_settings',
        'name' => 'is_task_dashboard_default',
        'label' => 'Is task dashboard the default page',
        'value' => '1'
      );
      civicrm_api3('OptionValue', 'create', $opValueParams);
    }

    return TRUE;
  }

  public function upgrade_1016()
  {
    CRM_Tasksassignments_DashboardSwitcher::switchToTasksAndAssignments();

    return true;
  }

  /**
   * Make sure that the Tasks and Assignments main menu item
   * (and subsequently the Dashboard menu item) are restricted to only the users
   * with 'access Tasks and Assignments' permission
   */
  public function upgrade_1018() {
    $taNavigation = new CRM_Core_BAO_Navigation();
    $taNavigation->name = 'tasksassignments';
    $taNavigation->find(true);

    if($taNavigation->id && !$taNavigation->permission) {
      $navigation = new CRM_Core_BAO_Navigation();
      $foo = array(
        'id' => $taNavigation->id,
        'permission' => 'access Tasks and Assignments',
        'separator'  => 1,
        'is_active'  => 1
      );

      $params = $navigation->add($foo);

      return true;
    }

    return false;
  }

  /**
   * Disables the Case menu items if Tasks&Assignments is enabled
   *
   * @return {boolean}
   */
  public function upgrade_1019() {
    $isEnabled = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_Extension', 'uk.co.compucorp.civicrm.tasksassignments', 'is_active', 'full_name');

    if ($isEnabled) {
      CRM_Core_DAO::executeQuery("UPDATE civicrm_navigation SET is_active=0 WHERE name = 'Cases' AND parent_id IS NULL");
      CRM_Core_BAO_Navigation::resetNavigation();
    }

    return true;
  }

  /*
   * Install Tasks Assignments 'days_to_create_a_document_clone' setting field.
   * It keeps a number of days to create a document clone before original
   * expiry date.
   * 
   * @return {boolean}
   */
  public function upgrade_1020() {
    $optionGroupID = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_OptionGroup', 'ta_settings', 'id', 'name');
    if (!$optionGroupID) {
      civicrm_api3('OptionGroup', 'create', array(
        'name' => 'ta_settings',
        'title' => 'Tasks and Assignments settings',
        'is_active' => 1,
        'is_reserved' => 1,
      ));
    }
    $optionValue = civicrm_api3('OptionValue', 'get', array(
      'sequential' => 1,
      'option_group_id' => 'ta_settings',
      'name' => "days_to_create_a_document_clone",
    ));
    if (empty($optionValue['id'])) {
      civicrm_api3('OptionValue', 'create', array(
        'option_group_id' => 'ta_settings',
        'name' => 'days_to_create_a_document_clone',
        'label' => t('Renewed document creation date offset (days)'),
        'value' => 0,
      ));
    }
    return TRUE;
  }

  /**
   * Uninstalls the dummy document types in old CiviHR installs
   * And adds real, default values
   */
  public function upgrade_1021() {
    $this->_uninstallActivityTypes('CiviDocument', array(
      'Joining Document 1', 'Exiting Document 1'
    ));

    $this->_installActivityTypes('CiviDocument', array(
      'VISA',
      'Passport',
      'Government Photo ID',
      'Driving licence',
      'Identity card',
      'Certificate of sponsorship (COS)'
    ));

    return TRUE;
  }

  /*
   * Set up scheduled job which clones documents on pre-set days before
   * their original expiry date.
   * 
   * @see PCHR-1365
   */
  public function upgrade_1022()
  {
    $dao = new CRM_Core_DAO_Job();
    $dao->api_entity = 'document';
    $dao->api_action = 'clonedocuments';
    $dao->find(TRUE);
    if (!$dao->id)
    {
      $dao = new CRM_Core_DAO_Job();
      $dao->domain_id = CRM_Core_Config::domainID();
      $dao->run_frequency = 'Daily';
      $dao->parameters = null;
      $dao->name = 'Clone Documents';
      $dao->description = 'Clone any approved document within pre-set days before its original expiry date';
      $dao->api_entity = 'document';
      $dao->api_action = 'clonedocuments';
      $dao->is_active = 1;
      $dao->save();
    }

    return TRUE;
  }

  /**
   * Set up Documents Notification scheduled job.
   */
  public function upgrade_1023()
  {
    $dao = new CRM_Core_DAO_Job();
    $dao->api_entity = 'document';
    $dao->api_action = 'senddocumentsnotification';
    $dao->find(TRUE);
    if (!$dao->id)
    {
      $dao = new CRM_Core_DAO_Job();
      $dao->domain_id = CRM_Core_Config::domainID();
      $dao->run_frequency = 'Daily';
      $dao->parameters = null;
      $dao->name = 'Documents Notification';
      $dao->description = 'Tasks and Assignments Documents Notification';
      $dao->api_entity = 'document';
      $dao->api_action = 'senddocumentsnotification';
      $dao->is_active = 1;
      $dao->save();
    }

    return TRUE;
  }

  public function upgrade_1024()
  {
    $this->executeCustomDataFile('xml/activity_custom_fields.xml');

    return TRUE;
  }

    public function uninstall()
    {
        CRM_Core_DAO::executeQuery("DELETE FROM `civicrm_navigation` WHERE name IN ('tasksassignments', 'ta_dashboard', 'tasksassignments_administer', 'ta_settings')");
        CRM_Core_BAO_Navigation::resetNavigation();

        return TRUE;
    }

    /**
     * Returns the activity type params starting with a component name,
     * specifically it returns the option group and component id
     *
     * @param  string $component
     * @return Array
     */
    private function _fetchActivityTypeParams($component) {
      $componentId = null;
      $componentQuery = 'SELECT id FROM civicrm_component WHERE name = %1';
      $componentParams = array(1 => array($component, 'String'));
      $componentResult = CRM_Core_DAO::executeQuery($componentQuery, $componentParams);

      if ($componentResult->fetch()) {
        $componentId = $componentResult->id;
      }

      if (!$componentId) {
        throw new Exception($component . ' Component not found.');
      }

      $optionGroupID = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_OptionGroup', 'activity_type', 'id', 'name');

      if (!$optionGroupID) {
        civicrm_api3('OptionGroup', 'create', array(
          'name' => 'activity_type',
          'title' => 'Activity Type',
          'is_active' => 1,
        ));

        $optionGroupID = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_OptionGroup', 'activity_type', 'id', 'name');
      }

      return array(
        'component_id' => $componentId,
        'option_group_id' => $optionGroupID
      );
    }

    private function _installActivityTypes($component, array $types) {
      $params = $this->_fetchActivityTypeParams($component);

      foreach ($types as $type) {
        civicrm_api3('OptionValue', 'create', array(
          'sequential' => 1,
          'option_group_id' => $params['option_group_id'],
          'component_id' => $params['component_id'],
          'label' => $type,
          'name' => $type,
        ));
      }
    }

    /**
     * Uninstall (if they exist) the given activity types for the given component
     *
     * @param  string $component
     * @param  array  $types
     */
    private function _uninstallActivityTypes($component, array $types) {
      $params = $this->_fetchActivityTypeParams('CiviDocument');
      $typeIds = array_map(function ($type) {
        return $type['id'];
      }, civicrm_api3('OptionValue', 'get', array(
        'component_id' => $params['component_id'],
        'option_group_id' => $params['option_group_id'],
        'name' => array('IN' => $types),
        'return' => 'id'
      ))['values']);

      foreach ($typeIds as $id) {
        civicrm_api3('OptionValue', 'delete', array('id' => $id));
      }
    }
}
