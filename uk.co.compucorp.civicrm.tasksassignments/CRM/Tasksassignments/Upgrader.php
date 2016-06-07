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
              //'permission' => 'access Tasksassignments',
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

        $this->_installTypes('CiviTask', array(
            'Joining' => array(
                'Schedule joining date',
                'Probation appraisal (start probation workflow)',
                'Group Orientation to organization, values, policies',
                'Enter employee data in CiviHR',
                'Issue appointment letter',
                'Fill Employee Details Form',
                'Submission of ID/Residence proofs and photos',
                'Program and work induction by program supervisor',
            ),
            'Exiting' => array(
                'Schedule Exit Interview',
                'Conduct Exit Interview',
                'Get "No Dues" certification',
                'Revoke Access to Database',
                'Block work email ID',
            ),
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
     * Install Document Types
     */
    public function upgrade_1011()
    {
        $this->_installTypes('CiviDocument', array(
            'Joining' => array(
                'Joining Document 1',
                'Joining Document 2',
                'Joining Document 3',
            ),
            'Exiting' => array(
                'Exiting document 1',
                'Exiting document 2',
                'Exiting document 3',
            ),
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
   * Disables the Case menu items if Tasks&Assignments is enabled
   *
   * @return {boolean}
   */
  public function upgrade_1017()
  {
    $isEnabled = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_Extension', 'uk.co.compucorp.civicrm.tasksassignments', 'is_active', 'full_name');
    $isCaseEnabled = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_Extension', 'org.civicrm.hrcase', 'is_active', 'full_name');

    if ($isEnabled && $isCaseEnabled) {
      CRM_Core_DAO::executeQuery("UPDATE civicrm_navigation SET is_active=0 WHERE name = 'Cases' AND parent_id IS NULL");
      CRM_Core_BAO_Navigation::resetNavigation();

      return true;
    }

    return false;
  }
    
    public function uninstall()
    {
        CRM_Core_DAO::executeQuery("DELETE FROM `civicrm_navigation` WHERE name IN ('tasksassignments', 'ta_dashboard', 'tasksassignments_administer', 'ta_settings')");
        CRM_Core_BAO_Navigation::resetNavigation();
        
        return TRUE;
    }
  
    function _installTypes($component, array $types)
    {
        $administerNavId = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_Navigation', 'Administer', 'id', 'name');
        if ($administerNavId)
        {
            
        }
        $componentId = null;
        $componentQuery = 'SELECT id FROM civicrm_component WHERE name = %1';
        $componentParams = array(
            1 => array($component, 'String'),
        );
        $componentResult = CRM_Core_DAO::executeQuery($componentQuery, $componentParams);
        if ($componentResult->fetch())
        {
            $componentId = $componentResult->id;
        }

        if (!$componentId)
        {
            throw new Exception($component . ' Component not found.');
        }

        $optionGroupID = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_OptionGroup', 'activity_type', 'id', 'name');
        if (!$optionGroupID) {
            $params = array(
                'name' => 'activity_type',
                'title' => 'Activity Type',
                'is_active' => 1,
            );
            civicrm_api3('OptionGroup', 'create', $params);
            $optionGroupID = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_OptionGroup', 'activity_type', 'id', 'name');
        }

        // Create the types:

        $selectActivityTypeQuery = 'SELECT id FROM civicrm_option_value WHERE option_group_id = %1 AND name = %2';
        foreach ($types as $caseType => $types)
        {
            foreach ($types as $type)
            {
                $selectActivityTypeParams = array(
                    1 => array($optionGroupID, 'Integer'),
                    2 => array($type, 'String'),
                );

                $selectActivityTypeResult = CRM_Core_DAO::executeQuery($selectActivityTypeQuery, $selectActivityTypeParams);
                if (!$selectActivityTypeResult->fetch())
                {
                    $result = civicrm_api3('OptionValue', 'create', array(
                        'sequential' => 1,
                        'option_group_id' => $optionGroupID,
                        'component_id' => $componentId,
                        'label' => $type,
                        'name' => $type,
                    ));
                }
                else
                {
                    $result = civicrm_api3('OptionValue', 'create', array(
                        'sequential' => 1,
                        'id' => $selectActivityTypeResult->id,
                        'component_id' => $componentId,
                        'name' => $type,
                    ));
                }
            }

            $this->_createCaseType($caseType, $types);
        }
    }

    function _createCaseType($name, array $types)
    {
        $result = civicrm_api3('CaseType', 'get', array(
          'sequential' => 1,
          'name' => $name,
        ));

        if ($result['count'])
        {
            return false;
        }

        $activityTypes = array();
        $activitySets = array(
            array(
                'name' => 'standard_timeline',
                'label' => 'Standard Timeline',
                'timeline' => 1,
                'activityTypes' => array(),
            )
        );
        $caseRoles = array(
            array(
                'name' => 'Case Coordinator',
                'creator' => 1,
                'manager' => 1,
            ),
        );

        $previousActivity = 'Open Case';
        foreach ($types as $type)
        {
            $activityTypes[] = array(
                'name' => $type,
            );

            $activitySets[0]['activityTypes'][] = array(
                'name' => $type,
                'status' => 'Scheduled',
                'reference_activity' => $previousActivity,
                'reference_offset' => 1,
                'reference_select' => 'newest',
            );
            $previousActivity = $type;
        }

        $result = civicrm_api3('CaseType', 'create', array(
            'sequential' => 1,
            'title' => $name,
            'name' => $name,
            'is_active' => 1,
            'weight' => 1,
            'definition' => array(
                'activityTypes' => $activityTypes,
                'activitySets' => $activitySets,
                'caseRoles' => $caseRoles,
                )
        ));

        return $result;
    }
}
