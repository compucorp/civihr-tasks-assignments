<?php

use CRM_Tasksassignments_Test_BaseHeadlessTest as BaseHeadlessTest;
use CRM_Tasksassignments_Test_Fabricator_Case as CaseFabricator;
use CRM_Tasksassignments_Test_Fabricator_CaseType as CaseTypeFabricator;
use CRM_Tasksassignments_Test_Fabricator_Contact as ContactFabricator;
use CRM_Tasksassignments_Test_Fabricator_Task as TaskFabricator;
use CRM_Tasksassignments_BAO_Task as Task;

/**
 * @group headless
 */
class CRM_Tasksassignments_BAO_TaskTest extends BaseHeadlessTest {
  const SAMPLE_TASKS_COUNT = 3;

  private $_case = NULL;
  private $_taskType = NULL;
  private $_tasks = [];

  public function setUp() {
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
   * Fabricates and stores a Case and a list of Tasks for testing purposes.
   */
  private function setupCaseAndTasks($caseParameters = []) {
    $contact = ContactFabricator::fabricate();
    $caseType = CaseTypeFabricator::fabricate();
    $defaultCaseParameters = [
      'contact_id' => $contact['id'],
      'creator_id' => $contact['id'],
      'case_type_id' => $caseType['id']
    ];
    $caseParameters = array_merge($defaultCaseParameters, $caseParameters);
    $this->_case = CaseFabricator::fabricate($caseParameters);

    for ($i = 0; $i < self::SAMPLE_TASKS_COUNT; $i++) {
      $this->_tasks[] = TaskFabricator::fabricate([
        'case_id' => $this->_case['id'],
        'source_contact_id' => $contact['id'],
        'target_contact_id' => $contact['id'],
        'activity_type_id' => $this->_taskTypeId,
        'status_id' => 'Scheduled'
      ]);
    }
  }

  public function testGetCaseTypeCategoryFieldIdMethod() {
    $expectedCaseTypeCategoryFieldId = CRM_Core_BAO_CustomField::getCustomFieldID(
      'category',
      'case_type_category'
    );
    $actualCaseTypeCategoryFieldId = CRM_Tasksassignments_BAO_Task::getCaseTypeCategoryFieldId();

    $this->assertEquals($expectedCaseTypeCategoryFieldId, $actualCaseTypeCategoryFieldId);
  }

  /**
   * @expectedException CRM_Exception
   */
  public function testCreateTaskWithNoContacts() {
    $params = ['activity_type_id' => $this->_taskTypeId];

    Task::create($params);
  }

  /**
   * @expectedException CRM_Exception
   */
  public function testCreateTaskWithNoSource() {
    $params = [
      'activity_type_id' => $this->_taskTypeId,
      'assignee_contact_id' => 1,
      'target_contact_id' => 2
    ];

    Task::create($params);
  }

  public function testCreateTaskWithNoAssignee() {
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
  public function testCreateTaskWithNoTarget() {
    $params = [
      'activity_type_id' => $this->_taskTypeId,
      'source_contact_id' => 1,
      'assignee_contact_id' => 2
    ];

    Task::create($params);
  }

  public function testGetIncompletedStatuses() {
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

  public function testClosingTheCaseWhenAllTasksAreCompleted() {
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

  public function testNotClosingTheCaseWhenOnlySomeTasksAreCompleted() {
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

  public function testNotClosingTheCaseWhenTheCaseCategoryIsNotWorkflow() {
    $caseTypeCategoryField = 'custom_' . CRM_Tasksassignments_BAO_Task::getCaseTypeCategoryFieldId();

    $vacancyType = CaseTypeFabricator::fabricate([
      'name' => 'Application',
      $caseTypeCategoryField => 'Vacancy'
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
