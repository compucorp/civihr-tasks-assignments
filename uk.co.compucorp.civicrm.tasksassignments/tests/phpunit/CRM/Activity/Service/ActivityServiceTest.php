<?php

use CRM_Tasksassignments_Test_BaseHeadlessTest as BaseHeadlessTest;
use CRM_Activity_Service_ActivityService as ActivityService;

/**
 * @group headless
 */
class CRM_Activity_Service_ActivityServiceTest extends BaseHeadlessTest {

  function testFindByComponentFetchingDocuments() {
    $activities = ActivityService::findByComponent('CiviDocument');

    foreach($activities as $activity) {
      $this->assertFalse(ActivityService::isTaskComponent($activity['activity_type_id']));
    }
  }

  function testFindByComponentFetchingTasks() {
    $activities = ActivityService::findByComponent('CiviTask');

    foreach($activities as $activity) {
      $this->assertTrue(ActivityService::isTaskComponent($activity['activity_type_id']));
    }
  }

  function testFindByComponentLimitingResultsAmount() {
    $activities = ActivityService::findByComponent('CiviDocument', 1);

    $this->assertEquals(count($activities), 1);
  }

  /**
   * @expectedException CiviCRM_API3_Exception
   */
  function testFindByComponentFetchingByInvalidComponent() {
    $activities = ActivityService::findByComponent('NonExistingComponent');
  }

  function testCheckIfActivityTypeBelongsToComponent() {
    $activityTypeId = array_keys(civicrm_api3('Document', 'getoptions', [
      'field' => 'activity_type_id'
    ])['values'])[0];

    $activityBelongsToDocumentComponent =
      ActivityService::checkIfActivityTypeBelongsToComponent(
        $activityTypeId, 'CiviDocument');
    $activityBelongsToTaskComponent =
      ActivityService::checkIfActivityTypeBelongsToComponent(
        $activityTypeId, 'CiviTask');

    $this->assertTrue($activityBelongsToDocumentComponent);
    $this->assertFalse($activityBelongsToTaskComponent);
  }

  function testGetTypesIdsForComponent() {
    $typesIds = ActivityService::getTypesIdsForComponent('CiviDocument');

    foreach($typesIds as $typeId) {
      $this->assertTrue(ActivityService::checkIfActivityTypeBelongsToComponent(
        $typeId, 'CiviDocument'));
    }
  }

  function testIsTaskComponent() {
    $documentTypesIds = ActivityService::getTypesIdsForComponent('CiviDocument');

    foreach($documentTypesIds as $documentTypeId) {
      $this->assertFalse(ActivityService::isTaskComponent(
        $documentTypeId, 'CiviDocument'));
    }
  }

}
