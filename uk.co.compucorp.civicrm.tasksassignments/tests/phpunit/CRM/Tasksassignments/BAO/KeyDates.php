<?php

use CRM_Tasksassignments_Test_BaseHeadlessTest as BaseHeadlessTest;

/**
 * Tests for CRM\Tasksassignments\KeyDates Class of Tasks & Assignments extension
 * 
 * @group headless
 */
class CRM_Tasksassignments_KeyDatesTest extends BaseHeadlessTest {

  public function testDatesForDeletedContactsNotInResult() {
    $params = ['birth_date' => '1977-06-27', 'is_deleted' => 1];
    $deletedContact = $this->fabricateContact($params);
    $contacts[] = $this->fabricateContact(['birth_date' => '1978-06-19']);
    $contacts[] = $this->fabricateContact(['birth_date' => '1982-08-16']);

    $keyDates = civicrm_api3('KeyDates', 'get');

    $this->assertEquals(sizeof($contacts), $keyDates['count']);

    // Verify deleted contact is not in result
    foreach ($keyDates['values'] as $currentDate) {
      $this->assertNotEquals($currentDate['contact_id'], $deletedContact['id']);
    }
  }

  /**
   * Creates a sample contact
   *
   * @param array $params
   *
   * @return array
   */
  public static function fabricateContact($params = []) {
    $defaultParams = [
      'contact_type' => 'Individual',
      'first_name'   => 'John',
      'last_name'    => 'Doe',
    ];

    $params = array_merge($defaultParams, $params);
    $params['display_name'] = "{$params['first_name']} {$params['last_name']}";

    $result = civicrm_api3('Contact', 'create', $params);

    return array_shift($result['values']);
  }
}
