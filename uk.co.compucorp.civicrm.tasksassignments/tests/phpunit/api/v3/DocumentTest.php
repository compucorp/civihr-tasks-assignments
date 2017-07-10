<?php

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
    $this->quickCleanup(['civicrm_activity'], TRUE);
    $upgrader = CRM_Tasksassignments_Upgrader::instance();
    $upgrader->install();

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

}
