<?php

class CRM_Tasksassignments_BAO_Assignment extends CRM_Tasksassignments_DAO_Assignment
{
  /**
   * Create a new Assignment based on array-data
   *
   * @param array $params key-value pairs
   * @return CRM_Tasksassignments_DAO_Assignment|NULL
   *
  public static function create($params) {
    $className = 'CRM_Tasksassignments_DAO_Assignment';
    $entityName = 'Assignment';
    $hook = empty($params['id']) ? 'create' : 'edit';

    CRM_Utils_Hook::pre($hook, $entityName, CRM_Utils_Array::value('id', $params), $params);
    $instance = new $className();
    $instance->copyValues($params);
    $instance->save();
    CRM_Utils_Hook::post($hook, $entityName, $instance->id, $instance);

    return $instance;
  } */


  /**
   * Retrieve cases along with related contact details
   *
   * @param array $params Accept :
   *  - 'sort_name' : Sort name for the user you want to retrieve cases for.
   *  - 'limit' : The number of cases you want to retrieve.
   * @param array $excludeCaseIds
   *
   * @return array Of case and related data keyed on case id
   */
  public static function retrieveCases($params = array(), $excludeCaseIds = array()) {
    if ($sortName = CRM_Utils_Array::value('sort_name', $params)) {
      $config = CRM_Core_Config::singleton();
      $search = ($config->includeWildCardInName) ? "%$sortName%" : "$sortName%";
      $where[] = "( sort_name LIKE '$search' )";
    }
    if (is_array($excludeCaseIds) &&
      !CRM_Utils_System::isNull($excludeCaseIds)
    ) {
      $where[] = ' ( ca.id NOT IN ( ' . implode(',', $excludeCaseIds) . ' ) ) ';
    }

    $where[] = ' ( ca.is_deleted = 0 OR ca.is_deleted IS NULL ) ';

    //filter for permissioned cases.
    $filterCases = array();
    $doFilterCases = FALSE;
    if (!CRM_Core_Permission::check('access all cases and activities')) {
      $doFilterCases = TRUE;
      $session = CRM_Core_Session::singleton();
      $filterCases = CRM_Case_BAO_Case::getCases(FALSE, $session->get('userID'));
    }
    $whereClause = implode(' AND ', $where);

    $limitClause = '';
    if ($limit = CRM_Utils_Array::value('limit', $params)) {
      $limitClause = "LIMIT 0, $limit";
    }

    $query = "
    SELECT  c.id as contact_id,
            c.sort_name,
            ca.id,
            ca.subject as case_subject,
            civicrm_case_type.title as case_type,
            ca.start_date as start_date,
            ca.end_date as end_date,
            ca.status_id
      FROM  civicrm_case ca INNER JOIN civicrm_case_contact cc ON ca.id=cc.case_id
 INNER JOIN  civicrm_contact c ON cc.contact_id=c.id
 INNER JOIN  civicrm_case_type ON ca.case_type_id = civicrm_case_type.id
     WHERE  {$whereClause}
  ORDER BY  c.sort_name, ca.end_date
            {$limitClause}
";
    $dao = CRM_Core_DAO::executeQuery($query);
    $statuses = CRM_Case_BAO_Case::buildOptions('status_id', 'create');

    $cases = array();
    while ($dao->fetch()) {
      if ($doFilterCases && !array_key_exists($dao->id, $filterCases)) {
        continue;
      }
      $cases[$dao->id] = array(
        'sort_name' => $dao->sort_name,
        'case_type' => $dao->case_type,
        'contact_id' => $dao->contact_id,
        'start_date' => $dao->start_date,
        'end_date' => $dao->end_date,
        'case_subject' => $dao->case_subject,
        'case_status' => $statuses[$dao->status_id],
      );
    }
    $dao->free();

    return $cases;
  }
}
