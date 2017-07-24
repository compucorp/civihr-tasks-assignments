<?php

/**
 * Assignments Fabricator class
 */
class CRM_Tasksassignments_Test_Fabricator_Assignment {
  private static $defaultParams = [];

  private function setDefaultValues() {
    self::$defaultParams = [
      'case_type_id' => self::getOneCaseType(),
      'subject' => 'A subject ' . ('Y-m-d H:i:s'),
      'start_date' => ('Y-m-d H:i:s'),
      'status_id' => 1,
    ];
  }

  public static function fabricate($params = []) {
    self::setDefaultValues();
    return CRM_Tasksassignments_BAO_Assignment::create(array_merge(self::$defaultParams, $params));
  }

  private static function getOneCaseType() {
    $result = civicrm_api3('CaseType', 'get', [
      'sequential' => 1,
      'is_active' => 1,
      'options' => ['limit' => 1],
    ]);

    return $result['id'];
  }
}
