<?php

/**
 * Creates or updates an Document. See the example for usage
 *
 * @param array $params Associative array of property name/value
 *                             pairs for the document.
 * {@getfields document_create}
 *
 * @throws API_Exception
 * @return array Array containing 'is_error' to denote success or failure and details of the created document
 */
function civicrm_api3_document_create($params) {

  if (!empty($params['document'])) {
      return civicrm_api3_document_create_multiple($params);
  }
    
  if (empty($params['id'])) {
    civicrm_api3_verify_one_mandatory($params,
      NULL,
      array(
        'activity_name', 'activity_type_id', 'activity_label',
      )
    );
  }
  
  /* This code prevents creating a copy of Activity each time we pass 'case_id'
   * to 'create' method and when the Activity is already connected to the Case.
   * The code is commented out due to front-end JavaScript solution to the issue.
   * 
  if (!empty($params['id']) && !empty($params['case_id'])) {
    $activity = civicrm_api3('Document', 'get', array(
      'sequential' => 1,
      'id' => $params['id'],
      'return' => 'case_id',
    ));
    $activityValues = CRM_Utils_Array::first($activity['values']);
    if (!empty($activityValues['case_id']) && $activityValues['case_id'] == $params['case_id']) {
        unset($params['case_id']);
    }
  }
  */

  $errors = _civicrm_api3_document_check_params($params);

  if (!empty($errors)) {
    return $errors;
  }


  $values = $activityArray = array();
  _civicrm_api3_custom_format_params($params, $values, 'Document');

  if (!empty($values['custom'])) {
    $params['custom'] = $values['custom'];
  }

  $params['skipRecentView'] = TRUE;

  $case_id           = '';
  $createRevision    = FALSE;
  $oldActivityValues = array();
  if (!empty($params['case_id'])) {
    $case_id = $params['case_id'];
    if (!empty($params['id'])) {
      $oldActivityParams = array('id' => $params['id']);
      if (!$oldActivityValues) {
        CRM_Activity_BAO_Activity::retrieve($oldActivityParams, $oldActivityValues);
      }
      if (empty($oldActivityValues)) {
        throw new API_Exception(ts("Unable to locate existing activity."));
      }
      else {
        $activityDAO = new CRM_Activity_DAO_Activity();
        $activityDAO->id = $params['id'];
        $activityDAO->is_current_revision = 0;
        if (!$activityDAO->save()) {
          if (is_object($activityDAO)) {
            $activityDAO->free();
          }
          throw new API_Exception(ts("Unable to revision existing case activity."));
        }
        $createRevision = TRUE;
      }
    }
  }

  $deleteActivityAssignment = FALSE;
  if (isset($params['assignee_contact_id'])) {
    $deleteActivityAssignment = TRUE;
  }

  $deleteActivityTarget = FALSE;
  if (isset($params['target_contact_id'])) {
    $deleteActivityTarget = TRUE;
  }

  // this should all be handled at the BAO layer
  $params['deleteActivityAssignment'] = CRM_Utils_Array::value('deleteActivityAssignment', $params, $deleteActivityAssignment);
  $params['deleteActivityTarget'] = CRM_Utils_Array::value('deleteActivityTarget', $params, $deleteActivityTarget);

  if ($case_id && $createRevision) {
    // This is very similar to the copy-to-case action.
    if (!CRM_Utils_Array::crmIsEmptyArray($oldActivityValues['target_contact'])) {
      $oldActivityValues['targetContactIds'] = implode(',', array_unique($oldActivityValues['target_contact']));
    }
    if (!CRM_Utils_Array::crmIsEmptyArray($oldActivityValues['assignee_contact'])) {
      $oldActivityValues['assigneeContactIds'] = implode(',', array_unique($oldActivityValues['assignee_contact']));
    }
    $oldActivityValues['mode'] = 'copy';
    $oldActivityValues['caseID'] = $case_id;
    $oldActivityValues['activityID'] = $oldActivityValues['id'];
    $oldActivityValues['contactID'] = $oldActivityValues['source_contact_id'];

    $copyToCase = CRM_Activity_Page_AJAX::_convertToCaseActivity($oldActivityValues);
    if (empty($copyToCase['error_msg'])) {
      // now fix some things that are different from copy-to-case
      // then fall through to the create below to update with the passed in params
      $params['id'] = $copyToCase['newId'];
      $params['is_auto'] = 0;
      $params['original_id'] = empty($oldActivityValues['original_id']) ? $oldActivityValues['id'] : $oldActivityValues['original_id'];
    }
    else {
      throw new API_Exception(ts("Unable to create new revision of case activity."));
    }
  }

  // create Document
  $activityBAO = CRM_Tasksassignments_BAO_Document::create($params);

  if (isset($activityBAO->id)) {
    
    $activityCustomValues = array();
    $customFields = _civicrm_api3_document_getcustomfieldsflipped();
    foreach ($customFields as $key => $value) {
        if (isset($params[$key])) {
            $activityCustomValues[$value] = $params[$key];
        }
    }
    if (!empty($activityCustomValues)) {
        civicrm_api3('Activity', 'create', array_merge(
            array('id' => $activityBAO->id),
            $activityCustomValues
        ));
    }
      
    if ($case_id && !$createRevision) {
      // If this is a brand new case activity we need to add this
      $caseActivityParams = array('activity_id' => $activityBAO->id, 'case_id' => $case_id);
      CRM_Case_BAO_Case::processCaseActivity($caseActivityParams);
    }

    _civicrm_api3_object_to_array($activityBAO, $activityArray[$activityBAO->id]);
    //return civicrm_api3_create_success($activityArray, $params, 'activity', 'get', $activityBAO);
    return civicrm_api3_document_get(array(
        'sequential' => isset($params['sequential']) ? $params['sequential'] : 0,
        'debug' => isset($params['debug']) ? $params['debug'] : 0,
        'id' => $activityBAO->id
    ));
  }
}

function civicrm_api3_document_copy_to_assignment($params) {
    
    if (empty($params['id'])) {
        throw new API_Exception(ts("Please specify 'id' value(s)."));
    }
    if (empty($params['case_id'])) {
        throw new API_Exception(ts("Please specify 'case_id' value."));
    }
    
    if (empty($params['sequential'])) {
        $params['sequential'] = 0;
    }
    if (empty($params['debug'])) {
        $params['debug'] = 0;
    }
    
    $ids = (array)$params['id'];
    $caseId = (int)$params['case_id'];
    $result = array();
    foreach ($ids as $id) {
        $documentToAssignment = array(
          'sequential' => $params['sequential'],
          'debug' => $params['debug'],
          'id' => $id,
          'case_id' => $caseId,
        );
        $createResult = civicrm_api3('Document', 'create', $documentToAssignment);
        if ($createResult['count']) {
            $result[] = array_shift($createResult['values']);
        }
    }
    
    return civicrm_api3_create_success($result, $params);
}

function civicrm_api3_document_create_multiple($params) {
    
    if (empty($params['document'])) {
        throw new API_Exception(ts("Please specify 'document' array."));
    }
    
    if (empty($params['sequential'])) {
        $params['sequential'] = 0;
    }
    if (empty($params['debug'])) {
        $params['debug'] = 0;
    }
    
    $documents = (array)$params['document'];
    $result = array();
    foreach ($documents as $document) {
        $document['sequential'] = $params['sequential'];
        $document['debug'] = $params['debug'];
        $createResult = civicrm_api3('Document', 'create', $document);
        if ($createResult['count']) {
            $result[] = array_shift($createResult['values']);
        }
    }
    
    return civicrm_api3_create_success($result, $params);
}

/**
 * Specify Meta data for create. Note that this data is retrievable via the getfields function
 * and is used for pre-filling defaults and ensuring mandatory requirements are met.
 * @param array $params (reference) array of parameters determined by getfields
 */
function _civicrm_api3_document_create_spec(&$params) {

  //default for source_contact_id = currently logged in user
  $params['source_contact_id']['api.default'] = 'user_contact_id';

  $params['status_id']['api.aliases'] = array('activity_status');

  $params['assignee_contact_id'] = array(
    'name' => 'assignee_id',
    'title' => 'assigned to',
    'type' => 1,
    'FKClassName' => 'CRM_Activity_DAO_ActivityContact',
  );
  $params['target_contact_id'] = array(
    'name' => 'target_id',
    'title' => 'Activity Target',
    'type' => 1,
    'FKClassName' => 'CRM_Activity_DAO_ActivityContact',
  );

  $params['source_contact_id'] = array(
      'name' => 'source_contact_id',
      'title' => 'Activity Source Contact',
      'type' => 1,
      'FKClassName' => 'CRM_Activity_DAO_ActivityContact',
      'api.default' => 'user_contact_id',
  );

}

/**
 * Given a list of activities, append any extra data requested about the activities
 *
 * NOTE: Called by civicrm-core and CiviHR
 *
 * @param array $params API request parameters
 * @param array $activities
 * @return array new activities list
 */
function _civicrm_api3_document_get_formatResult($params, $activities) {
  $returns = CRM_Utils_Array::value('return', $params, array());
  if (!is_array($returns)) {
    $returns = str_replace(' ', '', $returns);
    $returns = explode(',', $returns);
  }
  $returns = array_fill_keys($returns, 1);

  foreach ($params as $n => $v) {
    if (substr($n, 0, 7) == 'return.') {
      $returnkey = substr($n, 7);
      $returns[$returnkey] = $v;
    }
  }
  $returns['source_contact_id'] = 1;
  foreach ($returns as $n => $v) {
    switch ($n) {
      case 'assignee_contact_id':
        foreach ($activities as $key => $activityArray) {
          $activities[$key]['assignee_contact_id'] = CRM_Activity_BAO_ActivityAssignment::retrieveAssigneeIdsByActivityId($activityArray['id']);
        }
        break;
      case 'target_contact_id':
        foreach ($activities as $key => $activityArray) {
          $activities[$key]['target_contact_id'] = CRM_Activity_BAO_ActivityTarget::retrieveTargetIdsByActivityId($activityArray['id']);
        }
        break;
      case 'source_contact_id':
        foreach ($activities as $key => $activityArray) {
          $activities[$key]['source_contact_id'] = CRM_Activity_BAO_Activity::getSourceContactID($activityArray['id']);
        }
        break;
      default:
        if (substr($n, 0, 6) == 'custom') {
          $returnProperties[$n] = $v;
        }
    }
  }
  if (!empty($activities) && (!empty($returnProperties) || !empty($params['contact_id']))) {
    foreach ($activities as $activityId => $values) {
      //@todo - should possibly load activity type id if not loaded (update with id)
      _civicrm_api3_custom_data_get($activities[$activityId], 'Activity', $activityId, NULL, CRM_Utils_Array::value('activity_type_id', $values));
    }
  }
  return $activities;
}


/**
 * Delete a specified Activity.
 *
 * @param array $params array holding 'id' of activity to be deleted
 * {@getfields activity_delete}
 *
 * @throws API_Exception
 * @return void|CRM_Core_Error  An error if 'activityName or ID' is invalid,
 *                         permissions are insufficient, etc. or CiviCRM success array
 *
 *
 *
 * @example ActivityDelete.php Standard Delete Example
 *
 */
function civicrm_api3_document_delete($params) {

  if (!CRM_Core_Permission::check('delete Tasks and Documents')) {
    throw new API_Exception('You don\'t have permissions to delete Documents');
  }
  
  if (CRM_Activity_BAO_Activity::deleteActivity($params)) {
    return civicrm_api3_create_success(1, $params, 'activity', 'delete');
  }
  else {
    throw new API_Exception('Could not delete activity');
  }
}

/**
 * Function to check for required params
 *
 * @param array $params associated array of fields
 *
 * @throws API_Exception
 * @throws Exception
 * @internal param bool $addMode true for add mode
 *
 * @return array $error array with errors
 */
function _civicrm_api3_document_check_params(&$params) {

  $contactIDFields = array_intersect_key($params,
                     array(
                       'source_contact_id' => 1,
                       'assignee_contact_id' => 1,
                       'target_contact_id' => 1,
                     )
  );

  // this should be handled by wrapper layer & probably the api would already manage it
  //correctly by doing post validation - ie. a failure should result in a roll-back = an error
  // needs testing
  if (!empty($contactIDFields)) {
    $contactIds = array();
    foreach ($contactIDFields as $fieldname => $contactfield) {
      if (empty($contactfield)) {
        continue;
      }
      if (is_array($contactfield)) {
        foreach ($contactfield as $contactkey => $contactvalue) {
          $contactIds[$contactvalue] = $contactvalue;
        }
      }
      else {
        $contactIds[$contactfield] = $contactfield;
      }
    }


    $sql = '
SELECT  count(*)
  FROM  civicrm_contact
 WHERE  id IN (' . implode(', ', $contactIds) . ' )';
    if (count($contactIds) != CRM_Core_DAO::singleValueQuery($sql)) {
      throw new API_Exception('Invalid ' .  ' Contact Id');
    }
  }


  $activityIds = array('activity' => CRM_Utils_Array::value('id', $params),
                 'parent' => CRM_Utils_Array::value('parent_id', $params),
                 'original' => CRM_Utils_Array::value('original_id', $params),
  );

  foreach ($activityIds as $id => $value) {
    if ($value &&
      !CRM_Core_DAO::getFieldValue('CRM_Activity_DAO_Activity', $value, 'id')
    ) {
      throw new API_Exception('Invalid ' . ucfirst($id) . ' Id');
    }
  }
  // this should be handled by wrapper layer & probably the api would already manage it
  //correctly by doing pseudoconstant validation
  // needs testing
  $activityTypes = CRM_Activity_BAO_Activity::buildOptions('activity_type_id', 'validate');
  $activityName  = CRM_Utils_Array::value('activity_name', $params);
  $activityName  = ucfirst($activityName);
  $activityLabel = CRM_Utils_Array::value('activity_label', $params);
  if ($activityLabel) {
    $activityTypes = CRM_Activity_BAO_Activity::buildOptions('activity_type_id', 'create');
  }

  $activityTypeId = CRM_Utils_Array::value('activity_type_id', $params);

  if ($activityName || $activityLabel) {
    $activityTypeIdInList = array_search(($activityName ? $activityName : $activityLabel), $activityTypes);

    if (!$activityTypeIdInList) {
      $errorString = $activityName ? "Invalid Activity Name : $activityName"  : "Invalid Activity Type Label";
      throw new Exception($errorString);
    }
    elseif ($activityTypeId && ($activityTypeId != $activityTypeIdInList)) {
      throw new API_Exception('Mismatch in Activity');
    }
    $params['activity_type_id'] = $activityTypeIdInList;
  }
  elseif ($activityTypeId &&
    !array_key_exists($activityTypeId, $activityTypes)
  ) {
    throw new API_Exception('Invalid Activity Type ID');
  }

  // check for activity duration minutes
  // this should be validated @ the wrapper layer not here
  // needs testing
  if (isset($params['duration_minutes']) && !is_numeric($params['duration_minutes'])) {
    throw new API_Exception('Invalid Activity Duration (in minutes)');
  }


  //if adding a new activity & date_time not set make it now
  // this should be managed by the wrapper layer & setting ['api.default'] in speces
  // needs testing
  if (empty($params['id']) && empty($params['activity_date_time'])) {
    $params['activity_date_time'] = CRM_Utils_Date::processDate(date('Y-m-d H:i:s'));
  }

  return NULL;
}

/**
 * @see _civicrm_api3_generic_getlist_params.
 *
 * @param $request array
 */
function _civicrm_api3_document_getlist_params(&$request) {
  $fieldsToReturn = array('activity_date_time', 'activity_type_id', 'subject', 'source_contact_id');
  $request['params']['return'] = array_unique(array_merge($fieldsToReturn, $request['extra']));
  $request['params']['options']['sort'] = 'activity_date_time DESC';
  $request['params'] += array(
    'is_current_revision' => 1,
    'is_deleted' => 0,
  );
}

/**
 * @see _civicrm_api3_generic_getlist_output
 *
 * @param $result array
 * @param $request array
 *
 * @return array
 */
function _civicrm_api3_document_getlist_output($result, $request) {
  $output = array();
  if (!empty($result['values'])) {
    foreach ($result['values'] as $row) {
      $data = array(
        'id' => $row[$request['id_field']],
        'label' => $row[$request['label_field']] ? $row[$request['label_field']] : ts('(no subject)'),
        'description' => array(CRM_Core_Pseudoconstant::getLabel('CRM_Activity_BAO_Activity', 'activity_type_id', $row['activity_type_id'])),
      );
      if (!empty($row['activity_date_time'])) {
        $data['description'][0] .= ': ' . CRM_Utils_Date::customFormat($row['activity_date_time']);
      }
      if (!empty($row['source_contact_id'])) {
        $data['description'][] = ts('By %1', array(1 => CRM_Core_DAO::getFieldValue('CRM_Contact_DAO_Contact', $row['source_contact_id'], 'display_name')));
      }
      foreach ($request['extra'] as $field) {
        $data['extra'][$field] = isset($row[$field]) ? $row[$field] : NULL;
      }
      $output[] = $data;
    }
  }
  return $output;
}

function civicrm_api3_document_get($params) {
    
    if (empty($params['return']))
    {
        $params['return'] = _civicrm_api3_document_getfields();
    } else {
        if (!is_array($params['return'])) {
            $params['return'] = explode(',', $params['return']);
            $params['return'] = array_map('trim', $params['return']);
        }
        $activityCustomValues = array();
        $customFields = _civicrm_api3_document_getcustomfieldsflipped();
        foreach ($customFields as $key => $value) {
            if (in_array($key, $params['return'])) {
                $params['return'][] = $value;
            }
        }
    }
    
    $activityIds = array();
    
    $assigneeContactId = isset($params['assignee_contact_id']) ? (array)$params['assignee_contact_id'] : null;
    $sourceContactId = isset($params['source_contact_id']) ? (array)$params['source_contact_id'] : null;
    $caseId = isset($params['case_id']) ? $params['case_id'] : null;
    $customFields = _civicrm_api3_document_getcustomfields();
    
    if ($assigneeContactId) {
        $result = civicrm_api3('ActivityContact', 'get', array(
          'sequential' => 1,
          'return' => 'activity_id',
          'contact_id' => array('IN' => $assigneeContactId),
          'record_type_id' => 1,
          'options' => array('limit' => 0),
        ));
        foreach ($result['values'] as $value) {
            $activityIds[] = $value['activity_id'];
        }
    }
    
    if ($sourceContactId) {
        $result = civicrm_api3('ActivityContact', 'get', array(
          'sequential' => 1,
          'return' => 'activity_id',
          'contact_id' => array('IN' => $sourceContactId),
          'record_type_id' => 2,
          'options' => array('limit' => 0),
        ));
        foreach ($result['values'] as $value) {
            $activityIds[] = $value['activity_id'];
        }
    }
    
    if (($assigneeContactId || $sourceContactId) && empty($activityIds)) {
        return civicrm_api3_create_success(array(), $params, 'document', 'getbycomponent');
    }
    
    if ($caseId) {
        $caseActivityIds = array_keys(CRM_Case_BAO_Case::getCaseActivity($caseId));
        $activityIds = !empty($activityIds) ? array_intersect($activityIds, $caseActivityIds) : $caseActivityIds;
        if (empty($activityIds)) {
            $activityIds[] = 0;
        }
    }
    
    if (!isset($params['id']) && !empty($activityIds)) {
        $params['id'] = array('IN' => $activityIds);
    }
    
    $types = _civicrm_api3_document_gettypesbycomponent('CiviDocument');
    $typesIds = array();
    
    if (!empty($types['values'])) {
        foreach ($types['values'] as $type) {
            $typesIds[] = $type['value'];
        }
        
        $getResult = civicrm_api3('Activity', 'get', array_merge(
            $params,
            array(
                'activity_type_id' => array('IN' => $typesIds),
            )
        ));
        
        $caseActivityQuery = 'SELECT case_id FROM civicrm_case_activity WHERE activity_id = %1';
        $fileCountQuery = 'SELECT COUNT(id) as file_count FROM civicrm_entity_file WHERE entity_table = "civicrm_activity" AND entity_id = %1';
        foreach ($getResult['values'] as $key => $value) {
            if (CRM_Core_DAO::checkTableExists('civicrm_case_activity')) {
                $caseActivityParams = array(
                    1 => array($value['id'], 'Integer'),
                );
                $caseActivityResult = CRM_Core_DAO::executeQuery($caseActivityQuery, $caseActivityParams);
                $getResult['values'][$key]['case_id'] = null;
                if ($caseActivityResult->fetch()) {
                    $getResult['values'][$key]['case_id'] = $caseActivityResult->case_id;
                }
            }
            
            $fileCountParams = array(
                1 => array($value['id'], 'Integer'),
            );
            $fileCountResult = CRM_Core_DAO::executeQuery($fileCountQuery, $fileCountParams);
            $fileCountResult->fetch();
            $getResult['values'][$key]['file_count'] = (int)$fileCountResult->file_count;
            
            foreach ($customFields as $customFieldKey => $customFieldData) {
                $customColumnResult = CRM_Core_DAO::executeQuery(
                    "SELECT {$customFieldData['name']} FROM {$customFieldData['table']} WHERE entity_id = %1",
                    array(
                        1 => array($getResult['values'][$key]['id'], 'Integer'),
                    )
                );
                if (!$customColumnResult->fetch()) {
                    continue;
                }
                $customFieldValue = $customColumnResult->$customFieldData['name'];
                if ($customFieldData['data_type'] == 'Date') {
                    $processDate = CRM_Utils_Date::processDate($customColumnResult->$customFieldData['name']);
                    $customFieldValue = CRM_Utils_Date::customFormat($processDate, '%Y-%m-%d');
                }
                $getResult['values'][$key][$customFieldData['name']] = $customFieldValue;
            }
        }
        
        return $getResult;
    }
    
    return civicrm_api3_create_success(array(), $params, 'document', 'getbycomponent');
}

function civicrm_api3_document_getoptions($params) {
    
    if ($params['field'] == 'activity_type_id') {
        $result = array();
        $sequential = isset($params['sequential']) ? $params['sequential'] : 0;
        $types = _civicrm_api3_document_gettypesbycomponent('CiviDocument');

        foreach ($types['values'] as $type) {
            if (!$sequential) {
                $result[$type['value']] = $type['name'];
            } else {
                $result[] = array(
                    'key' => $type['value'],
                    'value' => $type['name'],
                );
            }
        }

        return civicrm_api3_create_success($result, $params, 'document', 'get');
    }

    return civicrm_api3_generic_getoptions(array('entity' => 'Document', 'params' => $params));
}

function civicrm_api3_document_getstatuses($params) {
    
    $optionGroupID = (int)CRM_Core_DAO::getFieldValue('CRM_Core_DAO_OptionGroup', 'activity_status', 'id', 'name');
    
    if ($optionGroupID) {
        return $result = civicrm_api3('OptionValue', 'get', array_merge($params, array(
          'option_group_id' => $optionGroupID,
        )));
    }
    
    return null;
}

function civicrm_api3_document_getcustomfields() {
  return _civicrm_api3_document_getcustomfields();
}

function _civicrm_api3_document_gettypesbycomponent($component, $sequential = 1) {
    
    $optionGroup = civicrm_api3('OptionGroup', 'get', array(
      'sequential' => 1,
      'name' => "activity_type",
    ));

    if (!isset($optionGroup['id'])) {
      throw new API_Exception(ts("Cannot find OptionGroup with 'name' = 'activity_type'."));
    }
    
    $componentQuery = 'SELECT * FROM civicrm_component WHERE name = %1';
    $componentParams = array(
        1 => array($component, 'String'),
    );
    $componentResult = CRM_Core_DAO::executeQuery($componentQuery, $componentParams);
    if ($componentResult->fetch())
    {
        $componentId = $componentResult->id;
        
        $result = civicrm_api3('OptionValue', 'get', array(
          'sequential' => $sequential,
          'option_group_id' => $optionGroup['id'],
          'component_id' => $componentId,
        ));
        
        return $result;
    }
    
    return null;
}

function _civicrm_api3_document_getfields() {
    
    $fields = civicrm_api3('Document', 'getfields');
    return array_keys(array_merge($fields['values'], _civicrm_api3_document_getcustomfields()));
}

function _civicrm_api3_document_getcustomfields() {
    
    $result = array();
    
    $customGroup = civicrm_api3('CustomGroup', 'get', array(
      'sequential' => 1,
      'name' => "Activity_Custom_Fields",
    ));
    
    if (empty($customGroup['id'])) {
        return $result;
    }
    
    $customFields = civicrm_api3('CustomField', 'get', array(
      'sequential' => 1,
      'custom_group_id' => $customGroup['id'],
      'return' => array('id', 'name', 'data_type'),
    ));
    
    foreach ($customFields['values'] as $customField) {
        $result['custom_' . $customField['id']] = array(
            'name' => strtolower($customField['name']),
            'table' => $customGroup['values'][0]['table_name'],
            'data_type' => $customField['data_type'],
        );
    }
    
    return $result;
}

function _civicrm_api3_document_getcustomfieldsflipped() {
    
    $customFields = _civicrm_api3_document_getcustomfields();
    return array_flip(array_map(function($item) { return $item['name']; }, $customFields));
}

/*
 * Document Reminder on demand.
 */
function civicrm_api3_document_sendreminder($params) {
    
    if (empty($params['activity_id'])) {
        throw new API_Exception(ts("Please specify 'activity_id' value."));
    }
    
    $result = CRM_Tasksassignments_Reminder::sendReminder((int)$params['activity_id'], isset($params['notes']) ? $params['notes'] : '', true);
    return civicrm_api3_create_success($result, $params, 'document', 'reminder');
}

/*
 * Daily Document Reminder.
 */
function civicrm_api3_document_senddailyreminder($params) {
    
    CRM_Tasksassignments_Reminder::sendDailyReminder();
    return civicrm_api3_create_success(1, $params, 'document', 'dailyreminder');
}

/*
 * CRON action for cloning documents pre-set days before original expiry date.
 */
function civicrm_api3_document_clonedocuments($params) {
  return civicrm_api3_create_success(CRM_Tasksassignments_BAO_Document::cloneDocuments(), $params);
}

/*
 * Documents Notification scheduled job's entry point.
 */
function civicrm_api3_document_senddocumentsnotification($params) {
    $count = CRM_Tasksassignments_Reminder::sendDocumentsNotifications();
    return civicrm_api3_create_success($count, $params, 'document', 'senddocumentsnotification');
}
