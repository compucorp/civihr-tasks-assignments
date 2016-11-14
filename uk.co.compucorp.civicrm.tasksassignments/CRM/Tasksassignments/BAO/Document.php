<?php

class CRM_Tasksassignments_BAO_Document extends CRM_Tasksassignments_DAO_Document {

  const STATUS_AWAITING_UPLOAD = 1;
  const STATUS_AWAITING_APPROVAL = 2;
  const STATUS_APPROVED = 3;
  const STATUS_REJECTED = 4;

  /**
   * Create a new Document based on array-data
   *
   * @param array $params key-value pairs
   * @return CRM_Tasksassignments_DAO_Document|NULL
   */
  public static function create(&$params) {
    $entityName = 'Document';
    $hook = empty($params['id']) ? 'create' : 'edit';

    if ($hook === 'create') {
      // If creating a new Document, we require all three contacts to be defined.
      if (empty($params['source_contact_id']) || empty($params['target_contact_id']) || empty($params['assignee_contact_id'])) {
        throw new CRM_Exception("Please specify 'source_contact_id', 'target_contact_id' and 'assignee_contact_id'.");
      }
      if (empty($params['status_id'])) {
        $params['status_id'] = 1;
      }
    }

    CRM_Utils_Hook::pre($hook, $entityName, CRM_Utils_Array::value('id', $params), $params);

    $instance = parent::create($params);
    CRM_Tasksassignments_Reminder::sendReminder((int) $instance->id);

    CRM_Utils_Hook::post($hook, $entityName, $instance->id, $instance);

    return $instance;
  }

  /**
   * Clone documents if there are 'days_to_create_a_document_clone' days or less
   * before their expire date.
   * Return a count of cloned documents or NULL if 'days_to_create_a_document_clone'
   * is zero.
   * 
   * @return int|NULL
   */
  public static function cloneDocuments() {
    $daysToCreateADocumentClone = self::getDaysToCreateADocumentClone();
    if (!$daysToCreateADocumentClone) {
      return NULL;
    }
    $date = (new DateTime())
            ->add(new DateInterval('P' . $daysToCreateADocumentClone . 'D'));
    return self::cloneApprovedDocumentsWithExpireDate($date);
  }

  /**
   * Return a 'days_to_create_a_document_clone' value from T&A Settings.
   * 
   * @return int
   */
  protected static function getDaysToCreateADocumentClone() {
    $setting = civicrm_api3('TASettings', 'getsingle', array(
      'sequential' => 1,
      'fields' => "days_to_create_a_document_clone",
    ));
    return !empty($setting['value']) ? $setting['value'] : 0;
  }

  /**
   * Search for approved Documents having expire date less than given $expireDate
   * and create their clone.
   * Return a count of cloned documents.
   * 
   * @param DateTime $expireDate
   * @return int
   */
  protected static function cloneApprovedDocumentsWithExpireDate(DateTime $expireDate) {
    $count = 0;
    $query = "SELECT ac.id, ac.entity_id FROM civicrm_value_activity_custom_fields_11 ac "
      . "LEFT JOIN civicrm_component c ON c.name = 'CiviDocument' "
      . "LEFT JOIN civicrm_option_group og ON og.name = 'activity_type' "
      . "LEFT JOIN civicrm_option_value ov ON ov.option_group_id = og.id AND ov.component_id = c.id "
      . "LEFT JOIN civicrm_activity a ON a.id = ac.entity_id "
      . "WHERE DATE(ac.expire_date) <= %1 AND ac.clone_date IS NULL AND a.is_deleted = 0 AND a.status_id = 3 AND ov.component_id = c.id AND a.activity_type_id = ov.value";
    $params = array(
      1 => array($expireDate->format('Y-m-d'), 'String'),
    );
    $result = CRM_Core_DAO::executeQuery($query, $params);
    while ($result->fetch()) {
      $document = civicrm_api3('Document', 'getsingle', array(
        'id' => $result->entity_id,
        'return' => 'activity_type_id, activity_date_time, details, status_id, is_deleted, expire_date, case_id, source_contact_id, target_contact_id, assignee_contact_id',
      ));
      $clone = self::cloneDocument($document, $result->id);
      if (!empty($clone['id'])) {
        $count++;
      }
    }
    return $count;
  }

  /**
   * Clone particular document but with unsetting some fields according to
   * PCHR-1365 requirements.
   * 
   * @param array $document
   * @param int $expireId
   * @return array
   */
  protected static function cloneDocument(array $document, $expireId) {
    if (empty($document['id'])) {
      return NULL;
    }
    $originalId = $document['id'];
    $expireDateField = self::getExpireDateCustomFieldName();
    $document['activity_date_time'] = $document[$expireDateField];
    $document['status_id'] = self::STATUS_AWAITING_UPLOAD;
    unset($document[$expireDateField]);
    unset($document[$expireDateField . '_' . $expireId]);
    unset($document['expire_date']);
    unset($document['file_count']);
    unset($document['id']);
    $clone = civicrm_api3('Document', 'create', $document);
    if (!empty($clone['id'])) {
      // Update original document's 'clone_date' with current date
      // so so we'll know that the document has been already cloned.
      civicrm_api3('Document', 'create', array(
        'id' => $originalId,
        'clone_date' => (new DateTime())->format('Y-m-d'),
      ));
    }
    return $clone;
  }

  /**
   * Return a name of document expire date custom field.
   * 
   * @return string
   */
  protected static function getExpireDateCustomFieldName() {
    $customGroup = civicrm_api3('CustomGroup', 'get', array(
      'sequential' => 1,
      'name' => 'Activity_Custom_Fields',
    ));
    $customField = civicrm_api3('CustomField', 'getsingle', array(
      'sequential' => 1,
      'custom_group_id' => $customGroup['id'],
      'name' => 'expire_date',
      'return' => array('id', 'name', 'data_type'),
    ));
    return 'custom_' . $customField['id'];
  }
}
