<?php
use Civi\Test\HeadlessInterface;
use Civi\Test\TransactionalInterface;
use CRM_HRCore_Test_Fabricator_Contact as ContactFabricator;

/**
 * Tests for CRM\Tasksassignments\KeyDates Class of Tasks & Assignments extension
 * 
 * @group headless
 */
class CRM_Tasksassignments_KeyDatesTest extends PHPUnit_Framework_TestCase implements
  HeadlessInterface,
  TransactionalInterface {
  
  public function setUpHeadless() {
    return \Civi\Test::headless()
      ->install('uk.co.compucorp.civicrm.hrcore')
      ->installMe(__DIR__)
      ->apply();
  }
  
  public function testDatesForDeletedContactsNotInResult() {
    $deletedContact = ContactFabricator::fabricate(['birth_date' => '1977-06-27', 'is_deleted' => 1]);
    $contacts[] = ContactFabricator::fabricate(['birth_date' => '1978-06-19']);
    $contacts[] = ContactFabricator::fabricate(['birth_date' => '1982-08-16']);

    $keyDates = civicrm_api3('KeyDates', 'get', [
      'sequential' => 1,
    ]);

    $this->assertEquals(sizeof($contacts), $keyDates['count']);

    // Verify deleted contact is not in result
    foreach ($keyDates['values'] as $currentDate) {
      $this->assertNotEquals($currentDate['contact_id'], $deletedContact['id']);
    }
  }
}
