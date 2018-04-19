<?php

use CRM_Tasksassignments_Test_Fabricator_OptionValue as OptionValueFabricator;

/**
 * Option Group Fabricator class
 */
class CRM_Tasksassignments_Test_Fabricator_OptionGroup {
  /**
   * Fabricates an Option Group.
   *
   * @param array $params
   *
   * @return array
   */
  public static function fabricate($params = []) {
    $result = civicrm_api3('OptionGroup', 'create', $params);

    return array_shift($result['values']);
  }

  public static function fabricateCaseCategoryGroupAndValues() {
    self::fabricate(['name' => 'case_type_category']);
    OptionValueFabricator::fabricate([ 'name' => 'WORKFLOW', 'option_group_id' => 'case_type_category' ]);
    OptionValueFabricator::fabricate([ 'name' => 'VACANCY', 'option_group_id' => 'case_type_category'  ]);
  }

}
