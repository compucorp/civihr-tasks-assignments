<?php

use CRM_Tasksassignments_Test_BaseHeadlessTest as BaseHeadlessTest;

/**
 *
 * @group headless
 */
class CRM_Tasksassignments_BAO_AssignmentTest extends BaseHeadlessTest {

  use TasksassignmentsTestTrait;

  private $contact_id;

  private $case_type_id;

  private $open_status_id;

  public function setUp() {
    // Create Contact
    $params = ['first_name' => 'micky', 'last_name' => 'mouse'];
    $this->contact_id = $this->createContact($params);
    // Create Case Type
    $params = ['name' => 'test_case_type', 'title' => 'Test Case Type', 'is_active' => 1];
    $this->case_type_id = $this->createCaseType($params);
    // Create Case Status option values
    $params = ['name' => 'Opened', 'grouping' => 'Opened'];
    $this->open_status_id = $this->createOptionValue($params, 'case_status');
  }

  public function testRetrieveCasesWithoutExcludeCaseIds() {
    $casesFixtures = [
      ['subject' => 'test case', 'end_date' => null],
      ['subject' => 'test case2', 'end_date' => date('Ymd')]
    ];

    $defaultParams = [
      'creator_id' => $this->contact_id,
      'case_type_id' => $this->case_type_id,
      'status_id' => $this->open_status_id,
    ];

    $createdCases = [];
    foreach($casesFixtures as $caseFixture) {
      $params = array_merge($defaultParams, $caseFixture);
      $caseID = $this->createCase($params);
      $createdCases[$caseID] = $params;
    }

    $cases = CRM_Tasksassignments_BAO_Assignment::retrieveCases();

    $this->assertCount(count($createdCases), $cases);
    foreach($cases as $caseID => $caseValues) {
      $this->assertNotEmpty($createdCases[$caseID]);
      $this->assertEquals($createdCases[$caseID]['subject'], $caseValues['case_subject']);
      $this->assertEquals($this->contact_id, $caseValues['contact_id']);
      $this->assertEquals('Opened', $caseValues['case_status']);
    }
  }

  public function testRetrieveCasesWithExcludeCaseIds() {
    $casesFixtures = [
      ['subject' => 'test case', 'end_date' => date('Ymd')],
      ['subject' => 'test case2', 'end_date' => date('Ymd')],
      ['subject' => 'test case3', 'end_date' => date('Ymd')]
    ];

    $defaultParams = [
      'creator_id' => $this->contact_id,
      'case_type_id' => $this->case_type_id,
      'status_id' => $this->open_status_id,
    ];

    $createdCases = [];
    foreach($casesFixtures as $caseFixture) {
      $params = array_merge($defaultParams, $caseFixture);
      $caseID = $this->createCase($params);
      $createdCases[$caseID] = $params;
    }

    $caseIDs = array_keys($createdCases);
    $cases = CRM_Tasksassignments_BAO_Assignment::retrieveCases([], [$caseIDs[0], $caseIDs[1]]);

    $currentKey = $caseIDs[2];
    $this->assertCount(1, $cases);
    $this->assertNotEmpty($cases[$currentKey]);
    $this->assertEquals($createdCases[$currentKey]['subject'], $cases[$currentKey]['case_subject']);
    $this->assertEquals($this->contact_id, $cases[$currentKey]['contact_id']);
    $this->assertEquals('Opened', $cases[$currentKey]['case_status']);
  }

  public function testRetrieveCasesWithLimit() {
    $casesFixtures = [
      ['subject' => 'test case', 'end_date' => date('Ymd')],
      ['subject' => 'test case2', 'end_date' => date('Ymd', strtotime('+2 days'))],
      ['subject' => 'test case3', 'end_date' => date('Ymd', strtotime('+4 days'))]
    ];

    $defaultParams = [
      'creator_id' => $this->contact_id,
      'case_type_id' => $this->case_type_id,
      'status_id' => $this->open_status_id,
    ];

    $createdCases = [];
    foreach($casesFixtures as $caseFixture) {
      $params = array_merge($defaultParams, $caseFixture);
      $caseID = $this->createCase($params);
      $createdCases[$caseID] = $params;
    }

    $caseIDs = array_keys($createdCases);
    $cases = CRM_Tasksassignments_BAO_Assignment::retrieveCases(['limit' => 1]);

    $currentKey = $caseIDs[0];
    $this->assertCount(1, $cases);
    $this->assertNotEmpty($cases[$currentKey]);
    $this->assertEquals($createdCases[$currentKey]['subject'], $cases[$currentKey]['case_subject']);
    $this->assertEquals($this->contact_id, $cases[$currentKey]['contact_id']);
    $this->assertEquals('Opened', $cases[$currentKey]['case_status']);
  }

  public function testRetrieveCasesWithSortName() {
    // Create another contact
    $params = ['first_name' => 'donald', 'last_name' => 'duck'];
    $contact2 = $this->createContact($params);

    $casesFixtures = [
      ['subject' => 'test case', 'creator_id' => $this->contact_id],
      ['subject' => 'test case2', 'creator_id' => $this->contact_id],
      ['subject' => 'test case3', 'creator_id' => $contact2]
    ];

    $defaultParams = [
      'case_type_id' => $this->case_type_id,
      'status_id' => $this->open_status_id,
    ];

    $createdCases = [];
    foreach($casesFixtures as $caseFixture) {
      $params = array_merge($defaultParams, $caseFixture);
      $caseID = $this->createCase($params);
      $createdCases[$caseID] = $params;
    }

    $caseIDs = array_keys($createdCases);
    $cases = CRM_Tasksassignments_BAO_Assignment::retrieveCases(['sort_name' => 'duck']);

    $currentKey = $caseIDs[2];
    $this->assertCount(1, $cases);
    $this->assertNotEmpty($cases[$currentKey]);
    $this->assertEquals($createdCases[$currentKey]['subject'], $cases[$currentKey]['case_subject']);
    $this->assertEquals($contact2, $cases[$currentKey]['contact_id']);
    $this->assertEquals('Opened', $cases[$currentKey]['case_status']);
  }
}

