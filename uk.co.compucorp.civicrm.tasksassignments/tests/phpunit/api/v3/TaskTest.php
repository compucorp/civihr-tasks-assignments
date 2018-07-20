<?php

use CRM_Tasksassignments_Test_Fabricator_OptionValue as OptionValueFabricator;
use CRM_Tasksassignments_Test_BaseHeadlessTest as BaseHeadlessTest;
use CRM_Tasksassignments_Test_Fabricator_Case as CaseFabricator;
use CRM_Tasksassignments_Test_Fabricator_CaseType as CaseTypeFabricator;
use CRM_Tasksassignments_Test_Fabricator_Task as TaskFabricator;
use CRM_Tasksassignments_Test_Fabricator_Contact as ContactFabricator;
use CRM_Tasksassignments_Test_Fabricator_OptionGroup as OptionGroupFabricator;

/**
 * @group headless
 */
class api_v3_TaskTest extends BaseHeadlessTest {

  /**
   * @var int
   */
  private $_taskTypeId;

  /**
   * Runs the upgrader and creates task type required for test
   */
  public function setUp() {
    parent::setUp();
    $upgrader = CRM_Tasksassignments_Upgrader::instance();
    $upgrader->install();
    $result = OptionValueFabricator::fabricateTaskType();

    $this->_taskTypeId = $result['value'];
  }

  /**
   * Remove data created in setUp()
   */
  protected function tearDown() {
    civicrm_api3('OptionValue', 'get', [
      'option_group_id' => 'activity_type',
      'component_id' => 'CiviTask',
      'value' => $this->_taskTypeId,
      'api.OptionValue.delete' => ['id' => '$value.id'],
    ]);

    parent::tearDown();
  }

  /**
   * @expectedException CiviCRM_API3_Exception
   */
  public function testCreateTaskWithNoContacts() {
    civicrm_api3('Task', 'create', [
      'activity_type_id' => $this->_taskTypeId,
    ]);
  }

  /**
   * @expectedException CiviCRM_API3_Exception
   */
  public function testCreateTaskWithNoSource() {
    civicrm_api3('Task', 'create', [
      'activity_type_id' => $this->_taskTypeId,
      'assignee_contact_id' => 1,
      'target_contact_id' => 2,
    ]);
  }

  public function testCreateTaskWithNoAssignee() {
    $result = civicrm_api3('Task', 'create', [
      'activity_type_id' => $this->_taskTypeId,
      'source_contact_id' => 1,
      'target_contact_id' => 2,
    ]);

    $firstResult = array_pop($result['values']);

    $this->assertEquals(0, $result['is_error']);
    $this->assertEquals(1, $firstResult['source_contact_id']);
  }

  /**
   * @expectedException CiviCRM_API3_Exception
   */
  public function testCreateTaskWithNoTarget() {
    civicrm_api3('Task', 'create', [
      'activity_type_id' => $this->_taskTypeId,
      'source_contact_id' => 1,
      'assignee_contact_id' => 2,
    ]);
  }

  public function testFetchingAllTasks() {
    $contact = ContactFabricator::fabricate();

    // populate the db with tasks:
    $tasks = $this->fabricateSeveralTasks(5, [
      'activity_type_id' => $this->_taskTypeId,
      'source_contact_id' => $contact['id'],
      'target_contact_id' => $contact['id']
    ]);

    // fetch all tasks using the api:
    $result = civicrm_api3('Task', 'get', ['sequential' => 1]);

    $this->assertEquals(5, $result['count']);
    $this->assertEquals($tasks, $result['values']);
  }

  public function testFetchingBySourceWillReturnExpectedTasks() {
    $sourceContact = ContactFabricator::fabricate();
    $contactId = $sourceContact['id'];
    $params = [
      'activity_type_id' => $this->_taskTypeId,
      'source_contact_id' => $contactId,
      'target_contact_id' => $contactId,
    ];
    $task = TaskFabricator::fabricate($params);

    $params = ['source_contact_id' => $contactId];
    $results = civicrm_api3('Task', 'get', $params);

    $this->assertEquals(1, $results['count']);
    $returnedTask = array_shift($results['values']);
    $this->assertEquals($task['id'], $returnedTask['id']);
  }

  public function testFetchingAllTasksBelongingToCase() {
    $caseType = CaseTypeFabricator::fabricate();
    $contact = ContactFabricator::fabricate();

    // Application case setup and tests:
    $applicationCase = CaseFabricator::fabricate([
      'contact_id' => $contact['id'],
      'creator_id' => $contact['id'],
      'case_type_id' => $caseType['id'],
      'subject' => 'Sample Application Case'
    ]);

    $applicationTasks = $this->fabricateSeveralTasks(4, [
      'case_id' => $applicationCase['id'],
      'activity_type_id' => $this->_taskTypeId,
      'source_contact_id' => $contact['id'],
      'target_contact_id' => $contact['id']
    ]);

    $applicationResult = civicrm_api3('Task', 'get', [
      'case_id' => $applicationCase['id'],
      'sequential' => 1
    ]);

    $this->assertEquals($applicationTasks, $applicationResult['values']);

    // Joining case setup and tests:
    $joiningCase = CaseFabricator::fabricate([
      'contact_id' => $contact['id'],
      'creator_id' => $contact['id'],
      'case_type_id' => $caseType['id'],
      'subject' => 'Sample Joining Case'
    ]);

    // fabricate tasks for joining case type:
    $joiningTasks = $this->fabricateSeveralTasks(6, [
      'case_id' => $joiningCase['id'],
      'activity_type_id' => $this->_taskTypeId,
      'source_contact_id' => $contact['id'],
      'target_contact_id' => $contact['id']
    ]);

    $joiningResult = civicrm_api3('Task', 'get', [
      'case_id' => $joiningCase['id'],
      'sequential' => 1
    ]);

    $this->assertEquals($joiningTasks, $joiningResult['values']);
  }

  public function testFetchingAllTasksBelongingToCaseAndAssignee() {
    $caseType = CaseTypeFabricator::fabricate();
    $ana = ContactFabricator::fabricate();
    $bob = ContactFabricator::fabricate();
    $cecil = ContactFabricator::fabricate();

    $case = CaseFabricator::fabricate([
      'contact_id' => $cecil['id'],
      'creator_id' => $cecil['id'],
      'case_type_id' => $caseType['id']
    ]);

    $tasksAssignedToAna = $this->fabricateSeveralTasks(6, [
      'case_id' => $case['id'],
      'activity_type_id' => $this->_taskTypeId,
      'source_contact_id' => $cecil['id'],
      'target_contact_id' => $cecil['id'],
      'assignee_contact_id' => $ana['id']
    ]);

    $tasksAssignedToBob = $this->fabricateSeveralTasks(3, [
      'case_id' => $case['id'],
      'activity_type_id' => $this->_taskTypeId,
      'source_contact_id' => $cecil['id'],
      'target_contact_id' => $cecil['id'],
      'assignee_contact_id' => $bob['id']
    ]);

    $resultsForAna = civicrm_api3('Task', 'get', [
      'case_id' => $case['id'],
      'assignee_contact_id' => $ana['id'],
      'sequential' => 1
    ]);

    $resultsForBob = civicrm_api3('Task', 'get', [
      'case_id' => $case['id'],
      'assignee_contact_id' => $bob['id'],
      'sequential' => 1
    ]);

    $this->assertEquals($tasksAssignedToAna, $resultsForAna['values']);
    $this->assertEquals($tasksAssignedToBob, $resultsForBob['values']);
  }

  /**
   * Fabricates a specific amount of tasks using the given parameters. It returns
   * the list of fabricated tasks.
   *
   * @param int $howMany
   * @param array $params
   *
   * @return array
   */
  private function fabricateSeveralTasks($howMany, $params) {
    $tasks = [];

    for ($i = 0; $i < $howMany; $i++) {
      $tasks[] = TaskFabricator::fabricate($params);
    }

    return $tasks;
  }

}
