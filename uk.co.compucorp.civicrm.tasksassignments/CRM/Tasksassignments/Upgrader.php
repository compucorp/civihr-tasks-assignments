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
  
}
