<?php

class CRM_Tasksassignments_Test_Fabricator_OptionValue {

  private static $defaultParams = [
    'name' => 'Test Type',
    'option_group_id' => 'activity_type',
  ];

  /**
   * Fabricates an option value, merging given parameters with default minimum
   * params.
   *
   * @param array $params
   *   List of parameters to use to create the option value
   *
   * @return array
   */
  public static function fabricate($params = []) {
    $params = array_merge(self::$defaultParams, $params);
    $result = civicrm_api3('OptionValue', 'create', $params);

    return array_shift($result['values']);
  }

  /**
   * Fabricates a document type option value
   *
   * @param array $params
   *  List of parameters to use to create the document type
   *
   * @return array
   */
  public static function fabricateDocumentType($params = []) {
    $params = array_merge($params, ['component_id' => 'CiviDocument']);

    return self::fabricate($params);
  }

  /**
   * Fabricates a task type option value
   *
   * @param array $params
   *  List of parameters to use to create the task type
   *
   * @return array
   */
  public static function fabricateTaskType($params = []) {
    $params = array_merge($params, ['component_id' => 'CiviTask']);

    return self::fabricate($params);
  }

}
