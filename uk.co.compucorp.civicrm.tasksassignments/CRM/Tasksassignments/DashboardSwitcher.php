<?php

class CRM_Tasksassignments_DashboardSwitcher {
  public static function switchToTasksAndAssignments() {
    $dashboardUrl = 'civicrm/tasksassignments/dashboard#!/tasks';

    CRM_Core_DAO::executeQuery("UPDATE civicrm_navigation SET url=%1 WHERE name='Home'", array(
      1 => array(
        $dashboardUrl,
        'String'
      )
    ));
  }

  public static function switchToDefault() {
    $dashboardUrl = 'civicrm/dashboard?reset=1';

    CRM_Core_DAO::executeQuery("UPDATE civicrm_navigation SET url=%1 WHERE name='Home'", array(
      1 => array(
        $dashboardUrl,
        'String'
      )
    ));
  }
}