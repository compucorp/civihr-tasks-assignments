<?php

class CRM_Tasksassignments_Wrapper_StripInvalidTaskTypesWrapper implements \API_Wrapper
{
  /**
   * @var array
   */
  protected $validComponents = ["CiviTask", "CiviDocument"];

  /**
   * Restrict request for activity types to certain components
   *
   * @param array $apiRequest
   * @return array
   */
  public function fromApiInput($apiRequest)
  {
    $apiRequest['params']['component_id'] = ['IN' => $this->validComponents];
    $apiRequest['params']['is_active'] = 1;

    return $apiRequest;
  }

  /**
   * @param array $apiRequest
   * @param array $result
   * @return array
   */
  public function toApiOutput($apiRequest, $result)
  {
    return $result;
  }
}
