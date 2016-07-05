<?php


require_once 'CiviTest/CiviUnitTestCase.php';

/**
 * Class Api_DocumentTest
 */
class Api_DocumentTest extends CiviUnitTestCase {
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
}
