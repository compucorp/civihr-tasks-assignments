<?php


require_once 'CiviTest/CiviUnitTestCase.php';

/**
 * Class Api_TaskTest
 */
class api_v3_TaskTest extends CiviUnitTestCase {
  private $_taskTypeId = null;

  function setUp() {
    parent::setUp();
    $upgrader = CRM_Tasksassignments_Upgrader::instance();
    $upgrader->install();

    // Pick one of Task types.
    $taskTypes = civicrm_api3('Task', 'getoptions', array(
      'field' => 'activity_type_id',
    ));
    $this->_taskTypeId = array_shift($taskTypes['values']);
  }

  function tearDown() {
    parent::tearDown();
  }

  /**
   * @expectedException CiviCRM_API3_Exception
   */
  function testCreateTaskWithNoContacts() {
    civicrm_api3('Task', 'create', array(
      'activity_type_id' => $this->_taskTypeId,
    ));
  }

  /**
   * @expectedException CiviCRM_API3_Exception
   */
  function testCreateTaskWithNoSource() {
    civicrm_api3('Task', 'create', array(
      'activity_type_id' => $this->_taskTypeId,
      'assignee_contact_id' => 1,
      'target_contact_id' => 2,
    ));
  }

  /**
   * @expectedException CiviCRM_API3_Exception
   */
  function testCreateTaskWithNoAssignee() {
    civicrm_api3('Task', 'create', array(
      'activity_type_id' => $this->_taskTypeId,
      'source_contact_id' => 1,
      'target_contact_id' => 2,
    ));
  }

  /**
   * @expectedException CiviCRM_API3_Exception
   */
  function testCreateTaskWithNoTarget() {
    civicrm_api3('Task', 'create', array(
      'activity_type_id' => $this->_taskTypeId,
      'source_contact_id' => 1,
      'assignee_contact_id' => 2,
    ));
  }
}
