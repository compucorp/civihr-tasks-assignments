<?php

class CRM_Tasksassignments_Upgrader extends CRM_Tasksassignments_Upgrader_Base {

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
  
}
