<?php

class CRM_Tasksassignments_Wrapper_AssignmentDefinitionValidationWrapper implements API_Wrapper
{
  /**
   * @var array
   */
  protected $validComponents = ["CiviTask", "CiviDocument"];

  /**
   * @param array $apiRequest
   * @return array
   */
  public function fromApiInput($apiRequest)
  {
    $params = CRM_Utils_Array::value('params', $apiRequest);
    $definition = CRM_Utils_Array::value('definition', $params);

    $validTypes = $this->getValidTypes();
    $activityTypes = $this->getActivityTypes($definition);
    $invalidTypes = array_diff($activityTypes, $validTypes);

    if ($invalidTypes) {
      $typesList = implode(', ', $invalidTypes);
      $errorMsg = sprintf("Invalid activity types: %s", $typesList);
      $errorMsg .= '. Only active CiviTasks and CiviDocuments are allowed';
      throw new \API_Exception($errorMsg);
    }

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

  /**
   * @param $definition
   * @return array
   */
  private function getActivityTypes($definition)
  {
    $types = [];

    foreach ($definition['activityTypes'] as $activityType) {
      $types[] = $activityType['name'];
    }

    foreach ($definition['activitySets'] as $activitySet) {
      foreach ($activitySet['activityTypes'] as $activityType) {
        $types[] = $activityType['name'];
      }
    }

    return array_unique($types);
  }

  /**
   * @return array
   */
  private function getValidTypes()
  {
    $result = civicrm_api3('OptionValue', 'get', [
      'component_id' => ['IN' => $this->validComponents],
      'is_active' => 1,
      'options' => ['limit' => 0],
    ]);

    return array_map(function ($value) {
      return $value['name'];
    }, $result['values']);
  }
}
