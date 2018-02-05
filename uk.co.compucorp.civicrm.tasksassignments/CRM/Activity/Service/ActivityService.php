<?php

class CRM_Activity_Service_ActivityService {

  const RECORD_TYPE_ASSIGNEE = 1;
  const RECORD_TYPE_CREATOR = 2;
  const RECORD_TYPE_TARGET = 3;

  /**
   * Returns the activity types for a certain component.
   * Default limit is 0 (unlimited)
   *
   * @param $componentName
   *  The name of the component
   * @param int $limit
   *  The maximum number of results to return (zero = unlimited)
   *
   * @return array
   */
  public static function findByComponent($componentName, $limit = 0) {
    $params['component_id'] = $componentName;
    $params['option_group_id'] = 'activity_type';
    $params['options'] = ['limit' => $limit];
    $params['is_active'] = 1;

    $result = civicrm_api3('OptionValue', 'get', $params);

    return CRM_Utils_Array::value('values', $result, []);
  }

}
