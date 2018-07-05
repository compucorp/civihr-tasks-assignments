<?php

/**
 * TASettings.get API specification
 *
 * @param array $spec
 */
function _civicrm_api3_t_a_settings_get_spec(&$spec) {
  $spec['fields'] = [
    'name' => 'fields',
    'title' => 'Fields',
    'description' => 'Which field(s) you want returned',
    'type' => CRM_Utils_Type::T_STRING,
    'api.required' => 0,
  ];
}

/**
 * TASetting.get API
 *
 * Used to get one or all of the T&A settings.
 *
 * When used without any params, all the settings will be
 * returned. Otherwise, if the `fields` param is present,
 * only the given fields will be returned.
 *
 * @param array $params
 *
 * @return array
 * @throws \CiviCRM_API3_Exception
 */
function civicrm_api3_t_a_settings_get($params) {
  $fields = _civicrm_api3_t_a_settings_valid_fields();

  if (!empty($params['fields'])) {
    $fields = (array) $params['fields'];
  }

  $settings = _civicrm_api3_t_a_settings_get_settings();

  $result = [];

  foreach ($fields as $field) {
    if (array_key_exists($field, $settings['ta_settings'])) {
      $result[$field] = [
        'name' => $field,
        'value' => $settings['ta_settings'][$field] != 'null' ? $settings['ta_settings'][$field] : ''
      ];
    }
  }

  return civicrm_api3_create_success($result, $params, 'TASettings', 'get');
}

/**
 * TASettings.set API specification
 *
 * @param array $spec
 */
function _civicrm_api3_t_a_settings_set_spec(&$spec) {
  $spec['fields'] = [
    'name' => 'fields',
    'title' => 'Fields',
    'description' => 'Which field(s) you want set',
    'type' => CRM_Utils_Type::T_STRING,
    'api.required' => 1,
  ];
}

/**
 * TASettings.set API
 *
 * Used to set a new value in the T&A Settings. Usage:
 *
 * civicrm_api3('TASettings', 'set', [
 *   'field1' => 'bah',
 *   'field2' => 'foo',
 *   ...
 * ])
 *
 * @param array $params
 *
 * @return array
 * @throws \CiviCRM_API3_Exception
 *   An Error will be thrown if any of the given fields doesn't exist
 */
function civicrm_api3_t_a_settings_set($params) {
  $validFields = _civicrm_api3_t_a_settings_valid_fields();

  $requestFields = [];
  if (!empty($params['fields']) && is_array($params['fields'])) {
    $requestFields = $params['fields'];
  }

  foreach ($requestFields as $field => $value) {
    if (!in_array($field, $validFields)) {
      throw new \CiviCRM_API3_Exception("'{$field}' is not a valid field and cannot be set", 'invalid_field');
    }

    if ($field === 'is_task_dashboard_default') {
      if ($value == '1') {
        CRM_Tasksassignments_DashboardSwitcher::switchToTasksAndAssignments();
      }
      else {
        CRM_Tasksassignments_DashboardSwitcher::switchToDefault();
      }
    }
    if ($field === 'days_to_create_a_document_clone') {
      $value = (int) $value;
    }

    $settings = _civicrm_api3_t_a_settings_get_settings();

    $settings['ta_settings'][$field] = $value;

    civicrm_api3('Setting', 'create', $settings);
  }

  return civicrm_api3('TASettings', 'get', [
    'fields' => array_keys($params['fields']),
    'sequential' => isset($params['sequential']) ? $params['sequential'] : 0,
  ]);
}

/**
 * Returns the T&A Settings
 *
 * @return array
 * @throws \CiviCRM_API3_Exception
 */
function _civicrm_api3_t_a_settings_get_settings() {
  $settings = array_shift(civicrm_api3('Setting', 'get', [
    'sequential' => 1,
    'return' => ['ta_settings']
  ])['values']);

  return $settings;
}

/**
 * Returns a list of all the valid fields for the T&A Settings
 *
 * @return array
 */
function _civicrm_api3_t_a_settings_valid_fields() {
  return [
    'documents_tab',
    'keydates_tab',
    'add_assignment_button_title',
    'number_of_days',
    'auto_tasks_assigned_to',
    'is_task_dashboard_default',
    'days_to_create_a_document_clone',
  ];
}
