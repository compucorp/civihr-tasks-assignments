<?php

function civicrm_api3_t_a_settings_get($params) {
    
    $fields = array(
        'documents_tab',
        'keydates_tab',
        'add_assignment_button_title',
        'number_of_days',
        'auto_tasks_assigned_to',
    );
    
    if (!empty($params['fields'])) {
        $fields = (array)$params['fields'];
    }
    
    $result = array();
    
    foreach ($fields as $field) {
        $setting = civicrm_api3('OptionValue', 'get', array(
            'option_group_id' => 'ta_settings',
            'name' => $field,
        ));
        $item =  CRM_Utils_Array::first($setting['values']);
        $result[$field] = array(
            'name' => $item['name'],
            //'label' => $item['label'],
            'value' => $item['value'] != "null" ? $item['value'] : ""
        );
    }
    
    return civicrm_api3_create_success($result, $params, 'tasettings', 'get');
}

function civicrm_api3_t_a_settings_set($params) {
    
    foreach ((array)$params['fields'] as $key => $value) {
        $setting = civicrm_api3('OptionValue', 'get', array(
            'option_group_id' => 'ta_settings',
            'name' => $key,
        ));
        if (empty($setting['id'])) {
            continue;
        }
        civicrm_api3('OptionValue', 'create', array(
            'id' => $setting['id'],
            'value' => $value,
        ));
    }
    
    return civicrm_api3('TASettings', 'get', array(
        'fields' => array_keys($params['fields']),
        'sequential' => isset($params['sequential']) ? $params['sequential'] : 0,
    ));
}