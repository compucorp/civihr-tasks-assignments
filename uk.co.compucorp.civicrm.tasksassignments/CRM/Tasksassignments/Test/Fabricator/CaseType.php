<?php

class CRM_Tasksassignments_Test_Fabricator_CaseType {

  private static $defaultParams = [
    'title' => 'Test Case Type',
    'name' => 'test_case_type',
    'is_active' => 1,
    'sequential'   => 1,
    'weight' => 100,
    'definition' => [
      'activityTypes' => [
        ['name' => 'Test'],
      ],
      'activitySets' => [
        [
          'name' => 'set1',
          'label' => 'Label 1',
          'timeline' => 1,
          'activityTypes' => [
            ['name' => 'Open Case', 'status' => 'Completed'],
          ],
        ],
      ],
    ],
  ];

  /**
   * Fabricates a case type merging given parameters with default minimum
   * parameters.
   *
   * @param array $params
   *   List of parameters to use to create the Case Type
   *
   * @return array
   */
  public static function fabricate($params = []) {
    self::setDefaultCaseTypeCategoryValue();

    $params = array_merge(self::$defaultParams, $params);
    $result = civicrm_api3('CaseType', 'create', $params);

    return array_shift($result['values']);
  }

  /**
   * Appends the case type category value to the default parameters.
   * The default category value is "Workflow". Since the category parameter is a custom
   * field, the prefix "custom_" + field id is used.
   */
  public static function setDefaultCaseTypeCategoryValue() {
    $caseTypeCategoryField = 'custom_' . CRM_Tasksassignments_BAO_Task::getCaseTypeCategoryFieldId();
    self::$defaultParams[$caseTypeCategoryField] = 'Workflow';
  }

}
