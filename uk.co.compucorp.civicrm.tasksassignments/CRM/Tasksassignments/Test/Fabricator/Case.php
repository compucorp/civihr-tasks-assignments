<?php

/**
 * Case Fabricator class
 */
class CRM_Tasksassignments_Test_Fabricator_Case {
  private static $defaultParams = [
    'subject' => 'Sample Case'
  ];

  /**
   * Fabricates a Case.
   *
   * @param array $params
   *   List of parameters to use to create the Case.
   *   Array(
   *     'contact_id' => int $contactId,
   *     'creator_id' => int $contactId,
   *     'case_type_id' => int $caseTypeValue
   *     'subject' => string $subject
   *   );
   *
   * @return array
   */
  public static function fabricate($params = []) {
    $params = array_merge($params, self::$defaultParams);
    $result = civicrm_api3('Case', 'create', $params);

    return array_shift($result['values']);
  }

}
