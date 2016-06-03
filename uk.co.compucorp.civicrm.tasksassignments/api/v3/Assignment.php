<?php

require_once 'api/v3/Case.php';

/**
 * Open a new case, add client and manager roles, and add a specific timeline
 *
 * @param  array (
 * //REQUIRED:
 * 'case_type_id' => int OR
 * 'case_type' => str (provide one or the other)
 * 'contact_id' => int // case client
 * 'subject' => str
 *
 * //OPTIONAL
 * 'activity_set_name' => str // timeline name, standard timeline by default
 * 'medium_id' => int // see civicrm option values for possibilities
 * 'creator_id' => int // case manager, default to the logged in user
 * 'status_id' => int // defaults to 1 "ongoing"
 * 'location' => str
 * 'start_date' => str datestamp // defaults to: date('YmdHis')
 * 'duration' => int // in minutes
 * 'details' => str // html format
 *
 * @throws API_Exception
 * @return array api result array
 *
 * @access public
 * {@getfields case_create}
 */
function civicrm_api3_assignment_create($params) {
  if (!empty($params['id'])) {
    return civicrm_api3_case_update($params);
  }

  civicrm_api3_verify_mandatory($params, NULL, array('contact_id', 'subject', array('case_type', 'case_type_id')));
  _civicrm_api3_case_format_params($params);

  // If format_params didn't find what it was looking for, return error
  if (empty($params['case_type_id'])) {
    throw new API_Exception('Invalid case_type. No such case type exists.');
  }
  if (empty($params['case_type'])) {
    throw new API_Exception('Invalid case_type_id. No such case type exists.');
  }

  // Fixme: can we safely pass raw params to the BAO?
  $newParams = array(
    'case_type_id' => $params['case_type_id'],
    'creator_id' => $params['creator_id'],
    'status_id' => $params['status_id'],
    'start_date' => $params['start_date'],
    'end_date' => CRM_Utils_Array::value('end_date', $params),
    'subject' => $params['subject'],
  );

  $caseBAO = CRM_Case_BAO_Case::create($newParams);

  if (!$caseBAO) {
    throw new API_Exception('Case not created. Please check input params.');
  }

  foreach ((array) $params['contact_id'] as $cid) {
    $contactParams = array('case_id' => $caseBAO->id, 'contact_id' => $cid);
    if (is_callable('CRM_Case_BAO_Case::addCaseToContact')) {
        CRM_Case_BAO_Case::addCaseToContact($contactParams);
    } else {
        CRM_Case_BAO_CaseContact::create($contactParams);
    }
  }

  $values = array();
  _civicrm_api3_object_to_array($caseBAO, $values[$caseBAO->id]);

  return civicrm_api3_create_success($values, $params, 'case', 'create', $caseBAO);
}

function civicrm_api3_assignment_get($params) {
    return civicrm_api3_case_get($params);
}

function civicrm_api3_assignment_update($params) {
    return civicrm_api3_case_update($params);
}

function civicrm_api3_assignment_delete($params) {
    return civicrm_api3_case_delete($params);
}
