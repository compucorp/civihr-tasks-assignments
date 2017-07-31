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
   *
   * @return CRM_Tasksassignments_DAO_Document|NULL|object
   */
  public static function create(&$params) {
    $entityName = 'Document';
    $hook = empty($params['id']) ? 'create' : 'edit';

    if ($hook === 'create') {
      // If creating a new Document, we require these to be defined.
      if (empty($params['source_contact_id']) || empty($params['target_contact_id'])) {
        throw new CRM_Exception("Please specify 'source_contact_id' and 'target_contact_id'");
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
   * Clone all approved documents if there are 'days_to_create_a_document_clone'
   * days or less before their expire date.
   *
   * @return int
   *   Count of cloned documents
   */
  public static function cloneDocuments() {
    $daysBeforeExpiryToClone = self::getDaysBeforeExpiryToClone();
    if (!$daysBeforeExpiryToClone) {
      return NULL;
    }

    $interval = new DateInterval('P' . $daysBeforeExpiryToClone . 'D');
    $cutOffDate = (new DateTime())->add($interval);
    $documents = self::getDocumentsToClone($cutOffDate);

    $count = 0;
    foreach ($documents as $document) {
      self::cloneDocument($document);
      $count++;
    }

    return $count;
  }

  /**
   * Finds all documents that should be cloned
   *
   * @param DateTime $cutOffDate
   *  Documents with an expiry date less than or equal to this will be cloned.
   *
   * @return array
   */
  protected static function getDocumentsToClone(DateTime $cutOffDate) {
    $expiryField = static::getCustomFieldName('expire_date');
    $clonedField = static::getCustomFieldName('clone_date');
    $remindMeField = static::getCustomFieldName('remind_me');

    $fieldsRequiredForClone = [
      'target_contact_id',
      'activity_type_id',
      'details',
      'expire_date',
      'activity_date_time',
      'assignee_contact_id',
    ];

    $params = [
      $expiryField => ['<=' => $cutOffDate->format('Y-m-d')],
      $clonedField => ['IS NULL' => 1],
      $remindMeField => 1,
      'is_deleted' => 0,
      'status_id' => self::STATUS_APPROVED,
      'is_current_revision' => 1,
      'options' => ['limit' => 0],
      'return' => $fieldsRequiredForClone
    ];

    $result = civicrm_api3('Document', 'get', $params);

    return CRM_Utils_Array::value('values', $result, []);
  }

  /**
   * Creates a copy of a document with no attached files
   *
   * @param array $original
   *   The document to be cloned
   */
  protected static function cloneDocument(array $original) {
    $clone = $original;
    $origId = $original['id'];

    $clone['activity_date_time'] = $original['expire_date'];
    $clone['status_id'] = self::STATUS_AWAITING_UPLOAD;

    $fieldsToUnset = ['id', 'file_count', 'expire_date', 'document_number', 'valid_from'];
    foreach ($fieldsToUnset as $field) {
      unset($clone[$field]);
    }

    civicrm_api3('Document', 'create', $clone);

    // Update original's clone_date' so we know it has been cloned.
    $params = ['id' => $origId, 'clone_date' => date('Y-m-d')];
    civicrm_api3('Document', 'create', $params);
  }

  /**
   * Gets the custom field name for Documents
   *
   * @param string $fieldName
   *  The human-readable name for the field, e.g. "expiry_date"
   *
   * @return string|null
   */
  private static function getCustomFieldName($fieldName) {
    static $fieldNames;

    if (empty($fieldNames)) {
      $result = civicrm_api3('Document', 'getcustomfields');
      foreach ($result as $customFieldName => $data) {
        $fieldNames[$data['name']] = $customFieldName;
      }
    }

    return CRM_Utils_Array::value($fieldName, $fieldNames);
  }

  /**
   * Return a 'days_to_create_a_document_clone' value from T&A Settings.
   *
   * @return int
   */
  protected static function getDaysBeforeExpiryToClone() {
    $setting = civicrm_api3('TASettings', 'getsingle', [
      'fields' => 'days_to_create_a_document_clone',
    ]);

    return CRM_Utils_Array::value('value', $setting, 0);
  }

}
