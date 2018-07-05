<?php

function civicrm_api3_t_a_settings_get($params) {
  $fields = [
    'documents_tab',
    'keydates_tab',
    'add_assignment_button_title',
    'number_of_days',
    'auto_tasks_assigned_to',
    'is_task_dashboard_default',
    'days_to_create_a_document_clone',
  ];

  if (!empty($params['fields'])) {
    $fields = (array) $params['fields'];
  }

  $settings = array_shift(civicrm_api3('Setting', 'get', [
    'sequential' => 1,
    'return' => ['ta_settings'],
  ])['values']);

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

function civicrm_api3_t_a_settings_set($params) {
  foreach ((array) $params['fields'] as $key => $value) {
    if ($key === 'is_task_dashboard_default') {
      if ($value == '1') {
        CRM_Tasksassignments_DashboardSwitcher::switchToTasksAndAssignments();
      }
      else {
        CRM_Tasksassignments_DashboardSwitcher::switchToDefault();
      }
    }
    if ($key === 'days_to_create_a_document_clone') {
      $value = (int) $value;
    }

    $settings = array_shift(civicrm_api3('Setting', 'get', [
      'sequential' => 1,
      'return' => ['ta_settings']
    ])['values']);

    $settings['ta_settings'][$key] = $value;

    civicrm_api3('Setting', 'create', $settings);
  }

  return civicrm_api3('TASettings', 'get', [
    'fields' => array_keys($params['fields']),
    'sequential' => isset($params['sequential']) ? $params['sequential'] : 0,
  ]);
}
