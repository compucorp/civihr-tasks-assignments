<?php

use CRM_Tasksassignments_Test_BaseHeadlessTest as BaseHeadlessTest;
use CRM_Activity_Service_ActivityService as ActivityService;

/**
 * @group headless
 */
class CRM_Activity_Service_ActivityServiceTest extends BaseHeadlessTest {

  public function testFindByComponentForDocumentsReturnsDocumentActivityTypes() {
    $activities = ActivityService::findByComponent('CiviDocument');

    foreach($activities as $activity) {
      $this->assertTrue(ActivityService::isDocumentComponent($activity['value']));
    }
  }

  public function testFindByComponentForTasksReturnsTasksActivityTypes() {
    $activities = ActivityService::findByComponent('CiviTask');

    foreach($activities as $activity) {
      $this->assertTrue(ActivityService::isTaskComponent($activity['value']));
    }
  }

  public function testFindByComponentLimitingResultsAmount() {
    $activities = ActivityService::findByComponent('CiviDocument', 1);

    $this->assertEquals(count($activities), 1);
  }

  /**
   * @expectedException CiviCRM_API3_Exception
   */
  public function testFindByComponentByInvalidComponentThrowsError() {
    $activities = ActivityService::findByComponent('NonExistingComponent');
  }

  public function testGetTypesIdsForComponent() {
    $typesIds = ActivityService::getTypesIdsForComponent('CiviDocument');

    foreach($typesIds as $typeId) {
      $this->assertTrue(ActivityService::isDocumentComponent($typeId));
    }
  }

  public function testIsTaskComponentReturnsTrueForTaskTypeIds() {
    $documentTypesIds = ActivityService::getTypesIdsForComponent('CiviTask');

    foreach($documentTypesIds as $documentTypeId) {
      $this->assertTrue(ActivityService::isTaskComponent(
        $documentTypeId, 'CiviTask'));
    }
  }

  public function testIsTaskComponentReturnsFalseForDocumentTypeIds() {
    $documentTypesIds = ActivityService::getTypesIdsForComponent('CiviDocument');

    foreach($documentTypesIds as $documentTypeId) {
      $this->assertFalse(ActivityService::isTaskComponent(
        $documentTypeId, 'CiviTask'));
    }
  }

  public function testIsDocumentComponentReturnsTrueForDocumentTypeIds() {
    $documentTypesIds = ActivityService::getTypesIdsForComponent('CiviDocument');

    foreach($documentTypesIds as $documentTypeId) {
      $this->assertTrue(ActivityService::isDocumentComponent(
        $documentTypeId, 'CiviDocument'));
    }
  }

  public function testIsDocumentComponentReturnsFalseForTaskTypeIds() {
    $documentTypesIds = ActivityService::getTypesIdsForComponent('CiviTask');

    foreach($documentTypesIds as $documentTypeId) {
      $this->assertFalse(ActivityService::isDocumentComponent(
        $documentTypeId, 'CiviDocument'));
    }
  }

}
