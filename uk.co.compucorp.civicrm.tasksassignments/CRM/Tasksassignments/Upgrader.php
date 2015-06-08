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
                      'value' => 'Add Assignment',
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
    public function upgrade_0010()
    {
        CRM_Core_BAO_ConfigSetting::enableComponent('CiviTask');
        CRM_Core_BAO_ConfigSetting::enableComponent('CiviDocument');
        
        return TRUE;
    }
    
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
  
    function _installTypes($component, array $types)
    {
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
