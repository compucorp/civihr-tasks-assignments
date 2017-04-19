<?php

class CRM_Activity_Service_ActivityService {

  /**
   * Returns the activity types for a certain component. Default limit is 25
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
