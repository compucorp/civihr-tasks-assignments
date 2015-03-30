<?php

class CRM_Tasksassignments_Upgrader extends CRM_Tasksassignments_Upgrader_Base {

  public function install() {

    // $this->executeCustomDataFile('xml/customdata.xml');
    $this->executeSqlFile('sql/install.sql');
  }
  
}
