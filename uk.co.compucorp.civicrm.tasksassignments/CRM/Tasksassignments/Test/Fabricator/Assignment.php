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
    $params = array_merge(self::$defaultParams, $params);

    return CRM_Tasksassignments_BAO_Assignment::create($params);
  }

  /**
   * Creates an array with minimum parameters that should be used to create an
   * assignment.
   */
  private static function setDefaultValues() {
    self::$defaultParams = [
      'subject' => 'A subject ' . ('Y-m-d H:i:s'),
      'start_date' => ('Y-m-d H:i:s'),
      'status_id' => 1,
    ];
  }

}
