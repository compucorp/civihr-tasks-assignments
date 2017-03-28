<?php


require_once 'CiviTest/CiviUnitTestCase.php';

/**
 * Class CRM_Tasksassignments_BAO_DocumentTest
 */
class CRM_Tasksassignments_BAO_DocumentTest extends CiviUnitTestCase {
  private $_documentTypeId = null;

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
   * @expectedException CRM_Exception
   */
  function testCreateDocumentWithNoContacts() {
    $params = array(
      'activity_type_id' => $this->_documentTypeId,
    );
    CRM_Tasksassignments_BAO_Document::create($params);
  }

  /**
   * @expectedException CRM_Exception
   */
  function testCreateDocumentWithNoSource() {
    $params = array(
      'activity_type_id' => $this->_documentTypeId,
      'assignee_contact_id' => 1,
      'target_contact_id' => 2,
    );
    CRM_Tasksassignments_BAO_Document::create($params);
  }

  function testCreateDocumentWithNoAssignee() {
    $params = array(
      'activity_type_id' => $this->_documentTypeId,
      'source_contact_id' => 1,
      'target_contact_id' => 2,
    );
    $result = CRM_Tasksassignments_BAO_Document::create($params);

    $this->assertTrue($result instanceof CRM_Tasksassignments_DAO_Document);
    $this->assertEquals($this->_documentTypeId, $result->activity_type_id);
  }

  /**
   * @expectedException CRM_Exception
   */
  function testCreateDocumentWithNoTarget() {
    $params = array(
      'activity_type_id' => $this->_documentTypeId,
      'source_contact_id' => 1,
      'assignee_contact_id' => 2,
    );
    CRM_Tasksassignments_BAO_Document::create($params);
  }
}
