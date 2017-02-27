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
    $contact = ContactFabricator::fabricate(['birth_date' => '1977-06-27']);
    ContactFabricator::fabricate(['birth_date' => '1978-06-19']);
    ContactFabricator::fabricate(['birth_date' => '1982-08-16']);

    $query = '
      UPDATE civicrm_contact
      SET is_deleted = 1
      WHERE id = %1
    ';
    $params = [1 => [$contact['id'], 'Int']];
    CRM_Core_DAO::executeQuery($query, $params);

    $keyDates = civicrm_api3('KeyDates', 'get', [
      'sequential' => 1,
    ]);

    foreach ($keyDates['values'] as $currentDate) {
      $this->assertNotEquals($contact['id'], $currentDate['contact_id']);
    }
  }
}
