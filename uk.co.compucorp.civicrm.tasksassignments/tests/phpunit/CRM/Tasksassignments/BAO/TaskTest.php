<?php


require_once 'CiviTest/CiviUnitTestCase.php';

/**
 * Class CRM_Tasksassignments_BAO_TaskTest
 */
class CRM_Tasksassignments_BAO_TaskTest extends CiviUnitTestCase {
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
   * @expectedException CRM_Exception
   */
  function testCreateTaskWithNoContacts() {
    $params = array(
      'activity_type_id' => $this->_taskTypeId,
    );
    CRM_Tasksassignments_BAO_Task::create($params);
  }

  /**
   * @expectedException CRM_Exception
   */
  function testCreateTaskWithNoSource() {
    $params = array(
      'activity_type_id' => $this->_taskTypeId,
      'assignee_contact_id' => 1,
      'target_contact_id' => 2,
    );
    CRM_Tasksassignments_BAO_Task::create($params);
  }

  function testCreateTaskWithNoAssignee() {
    $params = array(
      'activity_type_id' => $this->_taskTypeId,
      'source_contact_id' => 1,
      'target_contact_id' => 2,
    );
    $result = CRM_Tasksassignments_BAO_Task::create($params);

    $this->assertTrue($result instanceof CRM_Activity_BAO_Activity);
  }

  /**
   * @expectedException CRM_Exception
   */
  function testCreateTaskWithNoTarget() {
    $params = array(
      'activity_type_id' => $this->_taskTypeId,
      'source_contact_id' => 1,
      'assignee_contact_id' => 2,
    );
    CRM_Tasksassignments_BAO_Task::create($params);
  }
}
