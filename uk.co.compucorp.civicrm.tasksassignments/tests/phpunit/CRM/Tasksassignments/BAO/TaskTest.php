<?php

use CRM_Tasksassignments_Test_BaseHeadlessTest as BaseHeadlessTest;
use CRM_Tasksassignments_Test_Fabricator_Case as CaseFabricator;
use CRM_Tasksassignments_Test_Fabricator_CaseType as CaseTypeFabricator;
use CRM_Tasksassignments_Test_Fabricator_Contact as ContactFabricator;
use CRM_Tasksassignments_Test_Fabricator_Task as TaskFabricator;
use CRM_Tasksassignments_Test_Fabricator_OptionValue as OptionValueFabricator;

/**
 * @group headless
 */
class CRM_Tasksassignments_BAO_TaskTest extends BaseHeadlessTest {
  const SAMPLE_TASKS_COUNT = 3;

  private $_case = null;
  private $_taskType = null;
  private $_tasks = [];

  function setUp() {
    parent::setUp();
    $upgrader = CRM_Tasksassignments_Upgrader::instance();
    $upgrader->install();

    $this->_taskType = OptionValueFabricator::fabricateTaskType();

    civicrm_api3('OptionGroup', 'create', ['name' => 'case_type_category']);
    OptionValueFabricator::fabricate([ 'name' => 'WORKFLOW', 'option_group_id' => 'case_type_category' ]);
    OptionValueFabricator::fabricate([ 'name' => 'VACANCY', 'option_group_id' => 'case_type_category'  ]);
  }

  /**
   * Fabricates and stores a Case and a list of Tasks for testing purposes.
   */
  private function setupCaseAndTasks($caseParameters = []) {
    $contact = ContactFabricator::fabricate();
    $caseType = CaseTypeFabricator::fabricate();
    $defaultCaseParameters = [
      'contact_id' => $contact['id'],
      'creator_id' => $contact['id'],
      'case_type_id' => $caseType['id'],
      'subject' => 'Sample Case'
    ];
    $caseParameters = array_merge($defaultCaseParameters, $caseParameters);
    $this->_case = CaseFabricator::fabricate($caseParameters);

    for ($i = 0; $i < self::SAMPLE_TASKS_COUNT; $i++) {
      $this->_tasks[] = TaskFabricator::fabricate([
        'case_id' => $this->_case['id'],
        'source_contact_id' => $contact['id'],
        'target_contact_id' => $contact['id'],
        'activity_type_id' => $this->_taskType['value'],
        'status_id' => 'Scheduled'
      ]);
    }
  }

  /**
   * @expectedException CRM_Exception
   */
  function testCreateTaskWithNoContacts() {
    $params = array(
      'activity_type_id' => $this->_taskType['value'],
    );
    CRM_Tasksassignments_BAO_Task::create($params);
  }

  /**
   * @expectedException CRM_Exception
   */
  function testCreateTaskWithNoSource() {
    $params = array(
      'activity_type_id' => $this->_taskType['value'],
      'assignee_contact_id' => 1,
      'target_contact_id' => 2,
    );
    CRM_Tasksassignments_BAO_Task::create($params);
  }

  function testCreateTaskWithNoAssignee() {
    $params = array(
      'activity_type_id' => $this->_taskType['value'],
      'source_contact_id' => 1,
      'target_contact_id' => 2,
    );
    $result = CRM_Tasksassignments_BAO_Task::create($params);

    $this->assertTrue($result instanceof CRM_Activity_DAO_Activity);
    $this->assertEquals($this->_taskType['value'], $result->activity_type_id);
  }

  /**
   * @expectedException CRM_Exception
   */
  function testCreateTaskWithNoTarget() {
    $params = array(
      'activity_type_id' => $this->_taskType['value'],
      'source_contact_id' => 1,
      'assignee_contact_id' => 2,
    );
    CRM_Tasksassignments_BAO_Task::create($params);
  }

  function testClosingTheCaseWhenAllTasksAreCompleted() {
    $this->setupCaseAndTasks();

    foreach ($this->_tasks as $task) {
      civicrm_api3('Task', 'create', [
        'id' => $task['id'],
        'status_id' => 'Completed'
      ]);
    }

    $updatedCase = civicrm_api3('Case', 'getsingle', [
      'id' => $this->_case['id'],
      'return' => [ 'status_id.name' ]
    ]);

    $this->assertEquals('Closed', $updatedCase['status_id.name']);
  }

  function testNotClosingTheCaseWhenOnlySomeTasksAreCompleted() {
    $this->setupCaseAndTasks();

    civicrm_api3('Task', 'create', [
      'id' => $this->_tasks[0]['id'],
      'status_id' => 'Completed'
    ]);

    $updatedCase = civicrm_api3('Case', 'getsingle', [
      'id' => $this->_case['id'],
      'return' => [ 'status_id.name' ]
    ]);

    $this->assertEquals('Open', $updatedCase['status_id.name']);
  }

  function testNotClosingTHeCaseWhenTheCaseCategoryIsNotWorkflow() {
    $vacancyType = CaseTypeFabricator::fabricate([
      'name' => 'Application',
      'category' => 'VACANCY'
    ]);

    $this->setupCaseAndTasks([
      'case_type_id' => $vacancyType['id']
    ]);

    foreach ($this->_tasks as $task) {
      civicrm_api3('Task', 'create', [
        'id' => $task['id'],
        'status_id' => 'Completed'
      ]);
    }

    $updatedCase = civicrm_api3('Case', 'getsingle', [
      'id' => $this->_case['id'],
      'return' => [ 'status_id.name' ]
    ]);

    $this->assertEquals('Open', $updatedCase['status_id.name']);
  }
}
