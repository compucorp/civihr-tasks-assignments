<?php

/**
 * Assignments Fabricator class
 */
class CRM_Tasksassignments_Test_Fabricator_Task {

  private static $defaultParams = [
    'activity_name' => 'Test Task',
  ];

  /**
   * Fabricates a task merging given parameters with default minimum params.
   *
   * @param array $params
   *   List of parameters to use to create the Assignment
   *
   * @return array
   */
  public static function fabricate($params = []) {
    $params = array_merge($params, self::$defaultParams);
    $result = civicrm_api3('Task', 'create', $params);

    return array_shift($result['values']);
  }

}
