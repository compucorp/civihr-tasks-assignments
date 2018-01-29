<?php

/**
 * Assignments Fabricator class
 */
class CRM_Tasksassignments_Test_Fabricator_Task {

  /**
   * Fabricates a task merging given parameters with default minimum params.
   * Requires activity_type_id and source_contact_id
   *
   * @param array $params
   *   List of parameters to use to create the Assignment
   *
   * @return array
   */
  public static function fabricate($params = []) {
    $result = civicrm_api3('Task', 'create', $params);

    return array_shift($result['values']);
  }

}
