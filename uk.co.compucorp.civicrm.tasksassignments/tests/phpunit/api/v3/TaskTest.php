<?php

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

  function testCreateTaskWithNoAssignee() {
    $result = civicrm_api3('Task', 'create', array(
      'activity_type_id' => $this->_taskTypeId,
      'source_contact_id' => 1,
      'target_contact_id' => 2,
    ));

    $this->assertFalse($result['is_error']);
    $this->assertEquals(1, $result['values'][0]['source_contact_id']);
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
