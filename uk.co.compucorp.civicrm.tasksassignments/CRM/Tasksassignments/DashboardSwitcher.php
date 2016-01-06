<?php

class CRM_Tasksassignments_DashboardSwitcher {
  const CIVIHR_ADMIN_DRUPAL_ROLE_ID = '55120974';

  /**
   * This method does nothing on non-drupal installations
   *
   * @param string $dashboardUrl
   */
  private static function switchDrupalDashboard($dashboardUrl) {
    if(function_exists('db_update')) {
      db_update('front_page')
        ->fields(array(
          'data' => $dashboardUrl
        ))
        ->condition('rid', self::CIVIHR_ADMIN_DRUPAL_ROLE_ID, '=') // civihr_admin
        ->execute()
      ;
    }
  }

  /**
   * @param string $dashboardUrl
   */
  private static function switchCiviCRMDashboard($dashboardUrl) {
    CRM_Core_DAO::executeQuery("UPDATE civicrm_navigation SET url=%1 WHERE name='Home'", array(
      1 => array(
        $dashboardUrl,
        'String'
      )
    ));
  }

  public static function switchToTasksAndAssignments() {
    $dashboardUrl = 'civicrm/tasksassignments/dashboard#/tasks';

    static::switchCiviCRMDashboard($dashboardUrl);
    static::switchDrupalDashboard($dashboardUrl);
  }

  public static function switchToDefault() {
    static::switchCiviCRMDashboard('civicrm/dashboard?reset=1');
    static::switchDrupalDashboard('dashboard');
  }
}