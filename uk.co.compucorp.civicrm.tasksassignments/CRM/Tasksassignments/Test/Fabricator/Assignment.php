<?php

/**
 * Assignments Fabricator class
 */
class CRM_Tasksassignments_Test_Fabricator_Assignment {
  private static $defaultParams = [];

  /**
   * Fabricates an assignment merging given parameters with default minimum
   * parameters.
   *
   * @param array $params
   *   List of parameters to use to create the Assignment
   *
   * @return CRM_Case_BAO_Case
   */
  public static function fabricate($params = []) {
    self::setDefaultValues();
    return CRM_Tasksassignments_BAO_Assignment::create(array_merge(self::$defaultParams, $params));
  }

  /**
   * Creates an array with minimum parameters that should be used to create an
   * assignment.
   */
  private function setDefaultValues() {
    self::$defaultParams = [
      'case_type_id' => self::getOneCaseType(),
      'subject' => 'A subject ' . ('Y-m-d H:i:s'),
      'start_date' => ('Y-m-d H:i:s'),
      'status_id' => 1,
    ];
  }

  /**
   * Loads the first case type found in database and returns its ID.
   *
   * @return int
   *   ID of the first case type found
   */
  private static function getOneCaseType() {
    $result = civicrm_api3('CaseType', 'get', [
      'sequential' => 1,
      'is_active' => 1,
      'options' => ['limit' => 1],
    ]);

    return $result['id'];
  }
}
