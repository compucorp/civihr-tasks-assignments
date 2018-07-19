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

}
