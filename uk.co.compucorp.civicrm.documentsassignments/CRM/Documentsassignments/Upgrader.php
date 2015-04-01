<?php

class CRM_Documentsassignments_Upgrader extends CRM_Documentsassignments_Upgrader_Base {

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
  
}
