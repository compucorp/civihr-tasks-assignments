<?php


require_once 'CiviTest/CiviUnitTestCase.php';

/**
 * Class Api_DocumentTest
 */
class api_v3_DocumentTest extends CiviUnitTestCase {
  private $_documentTypeId = null;

  function __construct() {
    parent::__construct();
    self::cleanDB();
  }

  function setUp() {
    parent::setUp();
    $upgrader = CRM_Tasksassignments_Upgrader::instance();
    $upgrader->install();

    // Pick one of Document types.
    $documentTypes = civicrm_api3('Document', 'getoptions', array(
      'field' => 'activity_type_id',
    ));
    $this->_documentTypeId = array_shift($documentTypes['values']);
  }

  function tearDown() {
    parent::tearDown();
  }

  /**
   * @expectedException CiviCRM_API3_Exception
   */
  function testCreateDocumentWithNoContacts() {
    civicrm_api3('Document', 'create', array(
      'activity_type_id' => $this->_documentTypeId,
    ));
  }

  /**
   * @expectedException CiviCRM_API3_Exception
   */
  function testCreateDocumentWithNoSource() {
    civicrm_api3('Document', 'create', array(
      'activity_type_id' => $this->_documentTypeId,
      'assignee_contact_id' => 1,
      'target_contact_id' => 2,
    ));
  }

  /**
   * @expectedException CiviCRM_API3_Exception
   */
  function testCreateDocumentWithNoAssignee() {
    civicrm_api3('Document', 'create', array(
      'activity_type_id' => $this->_documentTypeId,
      'source_contact_id' => 1,
      'target_contact_id' => 2,
    ));
  }

  /**
   * @expectedException CiviCRM_API3_Exception
   */
  function testCreateDocumentWithNoTarget() {
    civicrm_api3('Document', 'create', array(
      'activity_type_id' => $this->_documentTypeId,
      'source_contact_id' => 1,
      'assignee_contact_id' => 2,
    ));
  }

  /**
   * Test 'clonedocuments' API call on Document entity.
   * Create three test documents and then call clone action.
   * First and third document should be cloned as they
   * meet 'clonedocuments' logic requirements (their 'expire_date'
   * is less than today date + 'days_to_create_a_document_clone' setting value.
   */
  function testCreateDocumentClone() {
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
}
