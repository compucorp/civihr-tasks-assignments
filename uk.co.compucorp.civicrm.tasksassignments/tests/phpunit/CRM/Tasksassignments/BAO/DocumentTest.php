<?php

use CRM_Tasksassignments_Test_BaseHeadlessTest as BaseHeadlessTest;
use CRM_Tasksassignments_BAO_Document as Document;

/**
 * @group headless
 */
class CRM_Tasksassignments_BAO_DocumentTest extends BaseHeadlessTest {

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

  /**
   * @expectedException CRM_Exception
   */
  function testCreateDocumentWithNoContacts() {
    $params = array(
      'activity_type_id' => $this->_documentTypeId,
    );
    Document::create($params);
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
    Document::create($params);
  }

  function testCreateDocumentWithNoAssignee() {
    $params = array(
      'activity_type_id' => $this->_documentTypeId,
      'source_contact_id' => 1,
      'target_contact_id' => 2,
    );
    $result = Document::create($params);

    $this->assertTrue($result instanceof CRM_Activity_DAO_Activity);
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
    Document::create($params);
  }

  function testGetIncompletedStatuses() {
    $incompleteStatuses = Document::getIncompleteStatuses();

    $this->assertEquals($incompleteStatuses, [1, 2]);
  }
}
