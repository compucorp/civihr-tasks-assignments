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
      'activity_date_time' => date('Y-m-d'),
      'status_id' => CRM_Tasksassignments_BAO_Document::STATUS_AWAITING_UPLOAD,
    ];
  }

}
