<?php
use CRM_Tasksassignments_Test_Fabricator_Assignment as AssignmentFabricator;
use CRM_Tasksassignments_Test_Fabricator_Document as DocumentFabricator;

/**
 * Class Api_DocumentTest
 */
class api_v3_DocumentTest extends CiviUnitTestCase {

  /**
   * @var int
   */
  private $_documentTypeId;

  /**
   * Runs installer and sets default document type
   */
  public function setUp() {
    parent::setUp();
    $this->quickCleanup(['civicrm_activity', 'civicrm_case', 'civicrm_case_activity'], TRUE);
    $upgrader = CRM_Tasksassignments_Upgrader::instance();
    $upgrader->install();

    $hrCaseUpgrader = CRM_HRCase_Upgrader::instance();
    $hrCaseUpgrader->install();

    // Pick one of Document types.
    $documentTypes = civicrm_api3('Document', 'getoptions', array(
      'field' => 'activity_type_id',
    ));
    $this->_documentTypeId = array_shift($documentTypes['values']);
  }

  /**
   * @expectedException CiviCRM_API3_Exception
   */
  public function testCreateDocumentWithNoContacts() {
    civicrm_api3('Document', 'create', array(
      'activity_type_id' => $this->_documentTypeId,
    ));
  }

  /**
   * @expectedException CiviCRM_API3_Exception
   */
  public function testCreateDocumentWithNoSource() {
    civicrm_api3('Document', 'create', array(
      'activity_type_id' => $this->_documentTypeId,
      'assignee_contact_id' => 1,
      'target_contact_id' => 2,
    ));
  }

  public function testCreateDocumentWithNoAssignee() {
    $result = civicrm_api3('Document', 'create', array(
      'activity_type_id' => $this->_documentTypeId,
      'source_contact_id' => 1,
      'target_contact_id' => 2,
    ));

    $firstResult = array_pop($result['values']);

    $this->assertEquals(0, $result['is_error']);
    $this->assertEquals(1, $firstResult['source_contact_id']);
  }

  /**
   * @expectedException CiviCRM_API3_Exception
   */
  public function testCreateDocumentWithNoTarget() {
    civicrm_api3('Document', 'create', array(
      'activity_type_id' => $this->_documentTypeId,
      'source_contact_id' => 1,
      'assignee_contact_id' => 2,
    ));
  }

  public function testDocumentCreationWorksWithoutDueDate() {
    $document = civicrm_api3('Document', 'create', array(
      'sequential' => 1,
      'activity_type_id' => $this->_documentTypeId,
      'source_contact_id' => 1,
      'assignee_contact_id' => 1,
      'target_contact_id' => 1,
    ));

    $this->assertEquals(0, $document['is_error']);
    $this->assertEquals(1, $document['values'][0]['source_contact_id']);
  }

  public function testDueDateWillBeEmptyWhenItsNotSet() {
    $document = civicrm_api3('Document', 'create', array(
      'sequential' => 1,
      'activity_type_id' => $this->_documentTypeId,
      'source_contact_id' => 1,
      'assignee_contact_id' => 1,
      'target_contact_id' => 1,
    ));

    $this->assertArrayNotHasKey('activity_date_time', $document['values'][0]);
  }

  /**
   * Test 'clonedocuments' API call on Document entity.
   * Create three test documents and then call clone action.
   * First and third document should be cloned as they
   * meet 'clonedocuments' logic requirements (their 'expire_date'
   * is less than today date + 'days_to_create_a_document_clone' setting value.
   */
  public function testCreateDocumentClone() {
    // Setting 'days_to_create_a_document_clone' to 5.
    civicrm_api3('TASettings', 'set', array(
      'sequential' => 1,
      'fields' => array('days_to_create_a_document_clone' => 5),
    ));

    // Creating a test Contact.
    $contact = civicrm_api3('Contact', 'create', array(
      'sequential' => 1,
      'contact_type' => 'Individual',
      'display_name' => 'Test Contact',
      'email' => 'test@email3215155.com',
    ));

    // Defining test parameters.
    $details1 = 'Some test Document 1 - clone test';
    $details2 = 'Some test Document 2 - clone test';
    $details3 = 'Some test past Document 3 - clone test';
    // Setting due date to 10 days ago.
    $dueDate = (new DateTime())->sub(new DateInterval('P10D'))->format('Y-m-d');
    // Setting expire date in 5 days.
    $expireDate1 = (new DateTime())->add(new DateInterval('P5D'))->format('Y-m-d');
    // Setting second expire date in 6 days.
    $expireDate2 = (new DateTime())->add(new DateInterval('P6D'))->format('Y-m-d');
    // Setting second expire date to 5 days ago.
    $expireDate3 = (new DateTime())->sub(new DateInterval('P5D'))->format('Y-m-d');

    // Creating a test Document 1.
    civicrm_api3('Document', 'create', array(
      'activity_type_id' => $this->_documentTypeId,
      'source_contact_id' => $contact['id'],
      'target_contact_id' => [$contact['id']],
      'assignee_contact_id' => [$contact['id']],
      'details' => $details1,
      'remind_me' => 1,
      'activity_date_time' => $dueDate,
      'expire_date' => $expireDate1,
      'status_id' => 3,
    ));
    // Creating a test Document 2.
    civicrm_api3('Document', 'create', array(
      'activity_type_id' => $this->_documentTypeId,
      'source_contact_id' => $contact['id'],
      'target_contact_id' => [$contact['id']],
      'assignee_contact_id' => [$contact['id']],
      'details' => $details2,
      'remind_me' => 1,
      'activity_date_time' => $dueDate,
      'expire_date' => $expireDate2,
      'status_id' => 3,
    ));
    // Creating a test Document 3.
    civicrm_api3('Document', 'create', array(
      'activity_type_id' => $this->_documentTypeId,
      'source_contact_id' => $contact['id'],
      'target_contact_id' => [$contact['id']],
      'assignee_contact_id' => [$contact['id']],
      'details' => $details3,
      'remind_me' => 1,
      'activity_date_time' => $dueDate,
      'expire_date' => $expireDate3,
      'status_id' => 3,
    ));

    // Calling cloneDocuments() function (simulate scheduled job which runs daily).
    $clonedCount = civicrm_api3('Document', 'clonedocuments');
    // Now we should have Document 1 and 3 cloned (as
    // their expire_date is less or equal than current date + 'days_to_create_a_document_clone'
    // setting value.
    // So first - we check if $clonedCount equals 2.
    $this->assertEquals(2, $clonedCount['values']);

    // Then we check if there is properly cloned Document 1.
    $clonedDocument1 = civicrm_api3('Document', 'get', array(
      'details' => $details1,
      'activity_date_time' => $expireDate1,
    ));
    $this->assertEquals(1, $clonedDocument1['count']);

    // And we check if there is no cloned Document 2.
    $clonedDocument2 = civicrm_api3('Document', 'get', array(
      'details' => $details2,
      'activity_date_time' => $expireDate2,
    ));
    $this->assertEquals(0, $clonedDocument2['count']);

    // Finally, we call clonedocuments action again.
    $clonedCount = civicrm_api3('Document', 'clonedocuments');
    // And see if there are any documents cloned this time.
    // We expect $cloneCount to be zero (which means that there is no
    // cloned document.
    $this->assertEquals(0, $clonedCount['values']);
  }

  /**
   * Only documents with "remind me" = true should be cloned
   */
  public function testRemindMeDocumentClone() {
    civicrm_api3('TASettings', 'set', [
      'fields' => ['days_to_create_a_document_clone' => 5],
    ]);

    $contact = civicrm_api3('Contact', 'create', [
      'contact_type' => 'Individual',
      'display_name' => 'First Contact',
      'email' => 'test1@email3215155.com',
    ]);
    $details1 = 'First sample document details';
    $details2 = 'Second sample document details';
    $today = date('Y-m-d');
    $tomorrow = date('Y-m-d', strtotime('tomorrow'));

    // document with "remind me" = true
    civicrm_api3('Document', 'create', [
      'activity_type_id' => $this->_documentTypeId,
      'source_contact_id' => $contact['id'],
      'target_contact_id' => [$contact['id']],
      'assignee_contact_id' => [$contact['id']],
      'details' => $details1,
      'remind_me' => 1,
      'activity_date_time' => $today,
      'expire_date' => $tomorrow,
      'status_id' => 3,
    ]);
    // document with "remind me" = false
    civicrm_api3('Document', 'create', [
      'activity_type_id' => $this->_documentTypeId,
      'source_contact_id' => $contact['id'],
      'target_contact_id' => [$contact['id']],
      'assignee_contact_id' => [$contact['id']],
      'details' => $details2,
      'remind_me' => 0,
      'activity_date_time' => $today,
      'expire_date' => $tomorrow,
      'status_id' => 3,
    ]);

    $clonedCount = civicrm_api3('Document', 'clonedocuments');
    $this->assertEquals(1, $clonedCount['values']);

    // Then we check if there is properly cloned Document 1.
    $params = ['details' => $details1, 'activity_date_time' => $tomorrow];
    $clonedDocument1 = civicrm_api3('Document', 'get', $params);
    $this->assertEquals(1, $clonedDocument1['count']);

    // And we check if there is no cloned Document 2.
    $params = ['details' => $details2, 'activity_date_time' => $tomorrow];
    $clonedDocument2 = civicrm_api3('Document', 'get', $params);
    $this->assertEquals(0, $clonedDocument2['count']);

    $clonedCount = civicrm_api3('Document', 'clonedocuments');
    $this->assertEquals(0, $clonedCount['values']);
  }

  /**
   * Documents related to an assignment were generating a revision every time
   * they were updated. This caused the cloning functionality to copy each
   * document multiple times, one for each revision the document had. This test
   * verifies that even if a document has multiple revisions that meet cloning
   * criteria, only the latest revision is cloned.
   */
  public function testDocumentCloningOnlyClonesCurrentRevision() {
    $this->setDaysBeforeExpiryToClone(1);

    // Create assignment
    $assignment = AssignmentFabricator::fabricate();

    // Create document - we need to use the API so new revisions are created.
    $document = DocumentFabricator::fabricateWithAPI([
      'case_id' => $assignment->id,
    ]);
    $this->assertClonableRevisionCount(0);

    // Approve and set expiry date for document, should generate a new revision for each update
    DocumentFabricator::fabricateWithAPI([
      'id' => $document['id'],
      'case_id' => $assignment->id,
      'expire_date' => date('Y-m-d'),
      'remind_me' => 1,
      'status_id' => CRM_Tasksassignments_BAO_Document::STATUS_APPROVED,
    ]);
    $this->assertClonableRevisionCount(1);

    $clonedCount = civicrm_api3('Document', 'clonedocuments');
    $this->assertEquals(1, $clonedCount['values']);

    // Cloning should have created a new revision for the document also,
    // when updating cloned date. Thus original clonable revision should still
    // exist and be clonable (even if it's not current revision).
    $this->assertClonableRevisionCount(1);

    // Running clone documents again should not create new documents
    $clonedCount = civicrm_api3('Document', 'clonedocuments');
    $this->assertEquals(0, $clonedCount['values']);
  }

  public function testOnlyDocumentsAssignedToACaseCreateRevisionsOnUpdate() {
    $assignment = AssignmentFabricator::fabricate();

    $documents['standAloneDocument'] = DocumentFabricator::fabricateWithAPI();
    $documents['caseDocument'] = DocumentFabricator::fabricateWithAPI(['case_id' => $assignment->id]);
    $activityCount = civicrm_api3('Activity', 'getcount');
    $this->assertEquals(2, $activityCount);

    foreach ($documents as $currentDocument) {
      DocumentFabricator::fabricateWithAPI([
        'id' => $currentDocument['id'],
        'expire_date' => date('Y-m-d'),
        'remind_me' => 1,
        'status_id' => CRM_Tasksassignments_BAO_Document::STATUS_APPROVED,
      ]);
    }

    $activityCount = civicrm_api3('Activity', 'getcount');
    $this->assertEquals(3, $activityCount);

    $this->assertDocumentRevisionCount($documents['standAloneDocument']['id'], 1);
    $this->assertDocumentRevisionCount($documents['caseDocument']['id'], 2);
  }

  private function assertDocumentRevisionCount($documentID, $expectedCount) {
    $result = civicrm_api3('Activity', 'get', [
      'sequential' => 1,
      'activity_type_id' => "VISA",
      'id' => $documentID,
      'original_id' => $documentID,
      'options' => [
        'or' => [
          ["id", "original_id"]
        ]
      ],
    ]);

    $this->assertEquals($expectedCount, $result['count']);
  }

  /**
   * Asserts number of documents that could be cloned, not taking into account
   * if the document is a current revision or not.
   *
   * @param int $expectedCount
   *   Number of expected clonable revisions.
   */
  private function assertClonableRevisionCount($expectedCount) {
    $daysBeforeExpiryToClone = $this->getDaysBeforeExpiryToClone();
    $interval = new DateInterval('P' . $daysBeforeExpiryToClone . 'D');
    $cutOffDate = (new DateTime())->add($interval);

    $expiryField = $this->getCustomFieldColumnName('expire_date');
    $clonedField = $this->getCustomFieldColumnName('clone_date');
    $remindMeField = $this->getCustomFieldColumnName('remind_me');

    $params = [
      $expiryField => ['<=' => $cutOffDate->format('Y-m-d')],
      $clonedField => ['IS NULL' => 1],
      $remindMeField => 1,
      'is_deleted' => 0,
      'status_id' => CRM_Tasksassignments_BAO_Document::STATUS_APPROVED,
      'options' => ['limit' => 0],
    ];

    $result = civicrm_api3('Document', 'get', $params);
    $this->assertEquals($expectedCount, $result['count']);
  }

  /**
   * Obtain number of days before document expiring date configured in system.
   *
   * @return int
   *   Number of days before expiring date
   */
  private function getDaysBeforeExpiryToClone() {
    $setting = civicrm_api3('TASettings', 'getsingle', [
      'fields' => 'days_to_create_a_document_clone',
    ]);

    return CRM_Utils_Array::value('value', $setting, 0);
  }

  /**
   * Set number of days before document expiring date configured in system.
   *
   * @param int $days
   *   Number of days before document expiring date
   */
  private function setDaysBeforeExpiryToClone($days) {
    civicrm_api3('TASettings', 'set', [
      'fields' => ['days_to_create_a_document_clone' => $days],
    ]);
  }

  /**
   * Returns column name for the given custom field name.
   *
   * @param $fieldName
   *
   * @return string
   *   Column name of custom field
   */
  private function getCustomFieldColumnName($fieldName) {
    static $fieldNames;

    if (empty($fieldNames)) {
      $result = civicrm_api3('Document', 'getcustomfields');
      foreach ($result as $customFieldName => $data) {
        $fieldNames[$data['name']] = $customFieldName;
      }
    }

    return CRM_Utils_Array::value($fieldName, $fieldNames);
  }

  public function tearDown() {
    parent::tearDown();

    $upgrader = CRM_Tasksassignments_Upgrader::instance();
    $upgrader->uninstall();

    $hrCaseUpgrader = CRM_HRCase_Upgrader::instance();
    $hrCaseUpgrader->uninstall();
  }
}
