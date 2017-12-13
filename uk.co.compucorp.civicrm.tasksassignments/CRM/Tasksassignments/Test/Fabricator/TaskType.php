<?php

class CRM_Tasksassignments_Test_Fabricator_TaskType {

  private static $defaultParams = [
    'option_group_id' => 'activity_type',
    'name' => 'Test Task',
    'component_id' => 'CiviTask',
  ];

  /**
   * Fabricates an assignment merging given parameters with default minimum
   * parameters.
   *
   * @param array $params
   *   List of parameters to use to create the Task Type
   *
   * @return array
   */
  public static function fabricate($params = []) {
    $params = array_merge($params, self::$defaultParams);
    $result = civicrm_api3('OptionValue', 'create', $params);

    return array_shift($result['values']);
  }
}
