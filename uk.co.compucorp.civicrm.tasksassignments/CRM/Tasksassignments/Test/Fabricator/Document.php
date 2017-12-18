<?php

/**
 * Documents Fabricator class
 */
class CRM_Tasksassignments_Test_Fabricator_Document {

  /**
   * Fabricates Document using the BAO.
   *
   * @param array $params
   *   List of parameters to be passed to the BAO call.
   *
   * @return CRM_Tasksassignments_DAO_Document|NULL|object
   */
  public static function fabricate($params = []) {
    $params = array_merge(self::getDefaultParameters(), $params);

    return CRM_Tasksassignments_BAO_Document::create($params);
  }

  /**
   * Fabricates Document using an API call.
   *
   * @param $params
   *   List of parameters to be passed to the API call.
   *
   * @return array
   */
  public static function fabricateWithAPI($params = []) {
    $result = civicrm_api3(
      'Document',
      'create',
      array_merge(self::getDefaultParameters(), $params)
    );

    return array_shift($result['values']);
  }

  /**
   * Gets default minimum parametrs to create a document.
   *
   * @return array
   */
  private static function getDefaultParameters() {
    return [
      'activity_type_id' => self::getTestDocumentTypeID(),
      'activity_date_time' => date('Y-m-d'),
      'status_id' => CRM_Tasksassignments_BAO_Document::STATUS_AWAITING_UPLOAD,
      'priority_id' => self::getTestPriorityID(),
    ];
  }

  /**
   * Obtains the ID for the first document type it finds.
   *
   * @return int
   *   ID of the first valid document type found on the database
   */
  private static function getTestDocumentTypeID() {
    $result = civicrm_api3('OptionValue', 'get', [
      'option_group_id' => 'activity_type',
      'options' => ['limit' => 1],
      'component_id' => 'CiviDocument',
    ]);

    return array_shift($result['values'])['value'];
  }

  /**
   * Obtains the ID for the first priority it finds.
   *
   * @return int
   *   ID of the first valid priority found on the database
   */
  private static function getTestPriorityID() {
    $result = civicrm_api3('OptionValue', 'get', [
      'option_group_id' => 'priority',
      'options' => ['limit' => 1],
    ]);

    return array_shift($result['values'])['value'];
  }

}
