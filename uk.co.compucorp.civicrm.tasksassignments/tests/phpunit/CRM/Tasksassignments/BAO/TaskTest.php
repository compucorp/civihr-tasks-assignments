<?php

use CRM_Tasksassignments_Test_BaseHeadlessTest as BaseHeadlessTest;
use CRM_Tasksassignments_BAO_Task as Task;

/**
 * @group headless
 */
class CRM_Tasksassignments_BAO_TaskTest extends BaseHeadlessTest {
  private $_taskTypeId = null;

  function setUp() {
    parent::setUp();
    $upgrader = CRM_Tasksassignments_Upgrader::instance();
    $upgrader->install();

    // Pick one of Task types.
    $taskTypes = civicrm_api3('Task', 'getoptions', [
      'field' => 'activity_type_id'
    ]);
    $this->_taskTypeId = array_shift($taskTypes['values']);
  }

  /**
   * @expectedException CRM_Exception
   */
  function testCreateTaskWithNoContacts() {
    $params = ['activity_type_id' => $this->_taskTypeId];

    Task::create($params);
  }

  /**
   * @expectedException CRM_Exception
   */
  function testCreateTaskWithNoSource() {
    $params = [
      'activity_type_id' => $this->_taskTypeId,
      'assignee_contact_id' => 1,
      'target_contact_id' => 2
    ];
    Task::create($params);
  }

  function testCreateTaskWithNoAssignee() {
    $params = [
      'activity_type_id' => $this->_taskTypeId,
      'source_contact_id' => 1,
      'target_contact_id' => 2
    ];
    $result = Task::create($params);

    $this->assertTrue($result instanceof CRM_Activity_DAO_Activity);
    $this->assertEquals($this->_taskTypeId, $result->activity_type_id);
  }

  /**
   * @expectedException CRM_Exception
   */
  function testCreateTaskWithNoTarget() {
    $params = [
      'activity_type_id' => $this->_taskTypeId,
      'source_contact_id' => 1,
      'assignee_contact_id' => 2
    ];
    Task::create($params);
  }

  function testGetIncompletedStatuses() {
    $incompleteStatuses = Task::getIncompleteStatuses();
    $expectedStatuses = [];
    $allStatuses = civicrm_api3('Task', 'getstatuses', [
      'sequential' => 1,
      'grouping' => ['IS NULL' => 1]
    ]);

    foreach ($allStatuses['values'] as $value) {
      $expectedStatuses[] = $value['value'];
    }

    $this->assertEquals($incompleteStatuses, $expectedStatuses);
  }
}
