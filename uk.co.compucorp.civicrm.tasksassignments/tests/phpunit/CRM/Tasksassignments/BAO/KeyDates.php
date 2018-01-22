<?php

use CRM_Tasksassignments_Test_BaseHeadlessTest as BaseHeadlessTest;
use CRM_Tasksassignments_Test_Fabricator_Contact as ContactFabricator;

/**
 * Tests for CRM\Tasksassignments\KeyDates Class of Tasks & Assignments extension
 * 
 * @group headless
 */
class CRM_Tasksassignments_KeyDatesTest extends BaseHeadlessTest {

  public function testDatesForDeletedContactsNotInResult() {
    $params = ['birth_date' => '1977-06-27', 'is_deleted' => 1];
    $deletedContact = ContactFabricator::fabricate($params);
    $contacts[] = ContactFabricator::fabricate(['birth_date' => '1978-06-19']);
    $contacts[] = ContactFabricator::fabricate(['birth_date' => '1982-08-16']);

    $keyDates = civicrm_api3('KeyDates', 'get');

    $this->assertEquals(sizeof($contacts), $keyDates['count']);

    // Verify deleted contact is not in result
    foreach ($keyDates['values'] as $currentDate) {
      $this->assertNotEquals($currentDate['contact_id'], $deletedContact['id']);
    }
  }

}
