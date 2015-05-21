<?php

function civicrm_api3_key_dates_get($params) {
    
    $startDate = isset($params['start_date']) ? $params['start_date'] : null;
    $endDate = isset($params['end_date']) ? $params['end_date'] : null;
    
    $result = CRM_Tasksassignments_KeyDates::get($startDate, $endDate);
    
    return civicrm_api3_create_success($result, $params, 'keydates', 'get');
}
