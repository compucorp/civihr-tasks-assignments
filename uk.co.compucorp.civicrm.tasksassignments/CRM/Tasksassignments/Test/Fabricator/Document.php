<?php
use CRM_HRCore_Test_Fabricator_Contact as ContactFbricator;

/**
 * Documents Fabricator class
 */
class CRM_Tasksassignments_Test_Fabricator_Document {
  private static $defaultParams = [];

  private static function setDefaultParameters() {
    $contact = ContactFbricator::fabricate();

    self::$defaultParams = [
      'activity_type_id' => self::getTypeID(),
      'activity_date_time' => date('Y-m-d'),
      'status_id' => CRM_Tasksassignments_BAO_Document::STATUS_AWAITING_UPLOAD,
      'priority_id' => self::getPriorityID(),
      'source_contact_id' => $contact['id'],
      'target_contact_id' => [$contact['id']],
      'assignee_contact_id' => [$contact['id']],
    ];
  }

  public static function fabricate($params) {
    self::setDefaultParameters();
    return CRM_Tasksassignments_BAO_Document::create(array_merge(self::$defaultParams, $params));
  }

  public static function fabricateWithAPI($params) {
    self::setDefaultParameters();
    $result = civicrm_api3(
      'Document',
      'create',
      array_merge(self::$defaultParams, $params)
    );

    return array_shift($result['values']);
  }

  public static function getCustomFieldName($fieldName) {
    static $fieldNames;

    if (empty($fieldNames)) {
      $result = civicrm_api3('Document', 'getcustomfields');
      foreach ($result as $customFieldName => $data) {
        $fieldNames[$data['name']] = $customFieldName;
      }
    }

    return CRM_Utils_Array::value($fieldName, $fieldNames);
  }

  private function getTypeID() {
    $result = civicrm_api3('OptionValue', 'get', [
      'sequential' => 1,
      'option_group_id' => 'activity_type',
      'options' => ['limit' => 1],
      'component_id' => 'CiviDocument',
    ]);

    return $result['values'][0]['value'];
  }

  private function getPriorityID() {
    $result = civicrm_api3('OptionValue', 'get', [
      'sequential' => 1,
      'option_group_id' => 'priority',
      'options' => ['limit' => 1],
      'component_id' => 'CiviDocument',
    ]);

    return $result['values'][0]['value'];
  }

}
