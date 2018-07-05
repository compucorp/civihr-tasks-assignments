<?php

use CRM_Tasksassignments_Test_BaseHeadlessTest as BaseHeadlessTest;

/**
 * Class api_v3_TaskTest
 *
 * @group headless
 */
class api_v3_TASettingsTest extends BaseHeadlessTest {

  private $validFields;
  private $defaultSettings;

  public function setUp() {
    $this->validFields = $this->getValidFields();

    foreach($this->validFields as $field) {
      $this->defaultSettings[$field] = '1';
    }

    civicrm_api3('TASettings', 'set', [
      'fields' => $this->defaultSettings
    ]);
  }

  public function testGetReturnsAllTheSettingsWhenCallWithoutParams() {
    $result = civicrm_api3('TASettings', 'get');

    $this->assertCount(count($this->validFields), $result['values']);

    foreach ($this->defaultSettings as $setting => $value) {
      $expected = [
        'name' => $setting,
        'value' => $value,
      ];

      $this->assertEquals($expected, $result['values'][$setting]);
    }
  }

  public function testGetReturnsOnlyTheSpecifiedFieldsWhenTheFieldsParamIsPassed() {
    $field = $this->validFields[array_rand($this->validFields)];

    $result = civicrm_api3('TASettings', 'get', [
      'sequential' => 1,
      'fields' => [$field]
    ]);

    $expected = [
      'name' => $field,
      'value' => $this->defaultSettings[$field]
    ];

    $this->assertEquals($expected, $result['values'][0]);
  }

  public function testSetUpdatesSettingsValuesAndReturnTheUpdatedValues() {
    $randKeys = array_rand($this->validFields, 2);

    $field1 = $this->validFields[$randKeys[0]];
    $field2 = $this->validFields[$randKeys[1]];

    $field1Value = 999999;
    $field2Value = 888;

    $result = civicrm_api3('TASettings', 'set', [
      'fields' => [
        $field1 => $field1Value,
        $field2 => $field2Value
      ]
    ]);

    $expected = [
      $field1 => [
        'name' => $field1,
        'value' => $field1Value
      ],
      $field2 => [
        'name' => $field2,
        'value' => $field2Value
      ]
    ];

    $this->assertEquals($expected, $result['values']);
  }

  private function getValidFields() {
    return _civicrm_api3_t_a_settings_valid_fields();
  }

}
