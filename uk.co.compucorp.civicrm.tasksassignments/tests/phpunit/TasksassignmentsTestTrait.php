<?php

/**
 * A trait with helper methods to be reused among this extension's tests
 */
trait TasksassignmentsTestTrait {

  /**
   * Creates single (Individuals) contact from the provided data.
   *
   * @param array $params Should contain first_name and last_name
   *
   * @return int Contact ID
   */
  protected function createContact($params) {
    if (empty($params['contact_type'])) {
      $params['contact_type'] = "Individual";
    }
    $params['display_name'] = $params['first_name'] . ' ' . $params['last_name'];
    $contact = CRM_Contact_BAO_Contact::create($params);

    return $contact->id;
  }

  /**
   * Create case type
   *
   * @param array $params Should contain 'name'
   *
   * @return int|NULL Case type ID
   */
  protected function createCaseType($params) {
    $caseType = CRM_Case_BAO_CaseType::create($params);
    if (!empty($caseType->id)) {
      return $caseType->id;
    }

    return NULL;
  }

  /**
   * Create a new case
   *
   * @param array $params Should contain 'creator_id', 'case_type_id' and 'status_id'
   *
   * @return int|NULL Case ID
   */
  protected function createCase($params) {
    $case = CRM_Case_BAO_Case::create($params);
    if (!empty($case->id)) {
      $contactParams = array('case_id' => $case->id, 'contact_id' => $params['creator_id']);
      CRM_Case_BAO_CaseContact::create($contactParams);

      return $case->id;
    }

    return NULL;
  }

  /**
   * Create option value for a specific option group
   * and if the group is not exist it will be created
   * before creating the option value.
   *
   * @param array $params Should contain 'name'
   * @param string $group Option group name
   *
   * @return string Option value (value)
   * @throws \CiviCRM_API3_Exception
   */
  protected function createOptionValue($params, $group) {
    $groupParams = ['name' => $group];
    $defaults = NULL;
    $optionGroup = CRM_Core_BAO_OptionGroup::retrieve($groupParams, $defaults);

    if (empty($optionGroup->id)) {
      $groupParams['is_active'] = 1;
      $optionGroup = CRM_Core_BAO_OptionGroup::add($groupParams);
    }
    $optionGroupID = $optionGroup->id;

    $params['option_group_id'] = $optionGroupID;
    $params['sequential'] = 1;
    $optionValue = civicrm_api3('OptionValue', 'create', $params);

    return $optionValue['values'][0]['value'];
  }


}
