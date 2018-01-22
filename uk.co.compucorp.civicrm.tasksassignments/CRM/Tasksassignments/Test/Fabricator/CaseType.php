<?php

class CRM_Tasksassignments_Test_Fabricator_CaseType {

  private static $defaultParams = [
    'name' => 'test_case_type',
    'title' => 'Test Case Type',
  ];

  /**
   * Fabricates a case type merging given parameters with default minimum
   * parameters.
   *
   * @param array $params
   *   List of parameters to use to create the Task Type
   *
   * @return array
   */
  public static function fabricate($params = []) {
    $params = array_merge($params, self::$defaultParams);
    $result = civicrm_api3('CaseType', 'create', $params);

    return array_shift($result['values']);
  }

}
