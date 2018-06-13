<?php

class CRM_Tasksassignments_Upgrader extends CRM_Tasksassignments_Upgrader_Base {
  const OPEN_CASE_TYPE = 'Open Case';

  public function install() {

    // $this->executeCustomDataFile('xml/customdata.xml');
    $this->executeSqlFile('sql/install.sql');

    $revisions = $this->getRevisions();

    foreach ($revisions as $revision) {
      $methodName = 'upgrade_' . $revision;
      if (is_callable(array($this, $methodName))) {
        $this->{$methodName}();
      }
    }

    $this->setComponentStatuses(array(
      'CiviTask' => TRUE,
      'CiviDocument' => TRUE,
    ));
  }

  public function enable() {
    $this->setComponentStatuses(array(
      'CiviTask' => TRUE,
      'CiviDocument' => TRUE,
    ));
    return TRUE;
  }

  public function disable() {
    $this->setComponentStatuses(array(
      'CiviTask' => FALSE,
      'CiviDocument' => FALSE,
    ));
  }

  /**
   * Set components as enabled or disabled. Leave any other
   * components unmodified.
   *
   * Note: This API has only been tested with CiviCRM 4.4.
   *
   * @param array $components keys are component names (e.g. "CiviMail"); values are bools
   */
  public function setComponentStatuses($components) {
    $getResult = civicrm_api3('setting', 'getsingle', array(
      'domain_id' => CRM_Core_Config::domainID(),
      'return' => array('enable_components'),
    ));

    if (!is_array($getResult['enable_components'])) {
      throw new CRM_Core_Exception("Failed to determine component statuses");
    }

    // Merge $components with existing list
    $enableComponents = $getResult['enable_components'];

    foreach ($components as $component => $status) {
      if ($status) {
        $enableComponents = array_merge($enableComponents, array($component));
      }
      else {
        $enableComponents = array_diff($enableComponents, array($component));
      }
    }

    civicrm_api3('setting', 'create', array(
      'domain_id' => CRM_Core_Config::domainID(),
      'enable_components' => array_unique($enableComponents),
    ));
    CRM_Core_Component::flushEnabledComponents();
  }

  public function upgrade_0001() {
    $optionGroupID = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_OptionGroup', 'task_status', 'id', 'name');

    if (!$optionGroupID) {
      $params = array(
        'name' => 'task_status',
        'title' => 'CiviTask Status',
        'is_active' => 1,
        'is_reserved' => 1,
      );

      civicrm_api3('OptionGroup', 'create', $params);

      $optionsValue = array(
        1 => 'Task sample status 1',
        2 => 'Task sample status 2',
        3 => 'Task sample status 3',
      );

      foreach ($optionsValue as $key => $value) {
        $opValueParams = array(
          'option_group_id' => 'task_status',
          'name' => $value,
          'label' => $value,
          'value' => $key,
        );

        civicrm_api3('OptionValue', 'create', $opValueParams);
      }
    }

    return TRUE;
  }

  public function upgrade_0002() {
    // Add Tasks and Assignments to the Top Navigation menu
    CRM_Core_DAO::executeQuery("DELETE FROM `civicrm_navigation` WHERE name = 'tasksassignments' and parent_id IS NULL");

    $weight = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_Navigation', 'Contacts', 'weight', 'name');
    //$contactNavId = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_Navigation', 'Contacts', 'id', 'name');
    $importJobNavigation = new CRM_Core_DAO_Navigation();
    $params = array(
      'domain_id'  => CRM_Core_Config::domainID(),
      'label'      => ts('Tasks and Assignments'),
      'name'       => 'tasksassignments',
      'url'        => 'civicrm/tasksassignments/dashboard#/tasks',
      'parent_id'  => NULL,
      'weight'     => $weight + 1,
      'permission' => 'access Tasks and Assignments',
      'separator'  => 1,
      'is_active'  => 1,
    );

    $importJobNavigation->copyValues($params);
    $importJobNavigation->save();
    CRM_Core_BAO_Navigation::resetNavigation();

    return TRUE;
  }

  public function upgrade_0003() {
    // Remove custom 'task_status' option group / values and group four of default 'activity_status' values as 'resolved'.
    $taskStatuses = array('Completed', 'Cancelled', 'Not Required', 'No_show');

    $optionGroupID = (int) CRM_Core_DAO::getFieldValue('CRM_Core_DAO_OptionGroup', 'task_status', 'id', 'name');

    if ($optionGroupID) {
      CRM_Core_DAO::executeQuery("DELETE FROM `civicrm_option_value` WHERE option_group_id = {$optionGroupID}");
      CRM_Core_DAO::executeQuery("DELETE FROM `civicrm_option_group` WHERE id = {$optionGroupID}");
    }

    $optionGroupID = (int) CRM_Core_DAO::getFieldValue('CRM_Core_DAO_OptionGroup', 'activity_status', 'id', 'name');

    if ($optionGroupID) {
      $result = civicrm_api3('OptionValue', 'get', array(
        'sequential' => 1,
        'option_group_id' => $optionGroupID,
      ));

      foreach ($result['values'] as $value) {
        if (in_array($value['name'], $taskStatuses)) {
          civicrm_api3('OptionValue', 'create', array(
            'sequential' => 1,
            'id' => $value['id'],
            'grouping' => 'resolved',
          ));
        }
      }
    }

    return TRUE;
  }

  /**
   * Install Documents statuses
   *
   * @return bool
   */
  public function upgrade_0006() {
    $optionGroupID = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_OptionGroup', 'document_status', 'id', 'name');

    if (!$optionGroupID) {
      $params = array(
        'name' => 'document_status',
        'title' => 'CiviDocument Status',
        'is_active' => 1,
        'is_reserved' => 1,
      );

      civicrm_api3('OptionGroup', 'create', $params);

      $optionsValue = array(
        1 => 'awaiting upload',
        2 => 'awaiting approval',
        3 => 'approved',
        4 => 'rejected',
      );

      foreach ($optionsValue as $key => $value) {
        $opValueParams = array(
          'option_group_id' => 'document_status',
          'name' => $value,
          'label' => $value,
          'value' => $key,
        );

        civicrm_api3('OptionValue', 'create', $opValueParams);
      }
    }

    return TRUE;
  }

  /**
   * Install Tasks Assignments custom settings.
   *
   * @return bool
   */
  public function upgrade_0007() {
    $optionGroupID = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_OptionGroup', 'ta_settings', 'id', 'name');

    if (!$optionGroupID) {
      $params = array(
        'name' => 'ta_settings',
        'title' => 'Tasks and Assignments settings',
        'is_active' => 1,
        'is_reserved' => 1,
      );

      civicrm_api3('OptionGroup', 'create', $params);

      $optionsValue = array(
        'documents_tab' => array(
          'label' => 'Show or hide the Documents tab',
          'value' => 1,
        ),
        'keydates_tab' => array(
          'label' => 'Show or hide the Key Dates tab',
          'value' => 1,
        ),
        'add_assignment_button_title' => array(
          'label' => 'Configure \'Add Assignment\' button title',
          'value' => '',
        ),
        'number_of_days' => array(
          'label' => 'No of days prior to Key Date to create task',
          'value' => 30,
        ),
        'auto_tasks_assigned_to' => array(
          'label' => 'Auto generated Tasks assigned to',
          'value' => '',
        ),
      );

      foreach ($optionsValue as $key => $value) {
        $opValueParams = array(
          'option_group_id' => 'ta_settings',
          'name' => $key,
          'label' => $value['label'],
          'value' => $value['value'],
        );

        civicrm_api3('OptionValue', 'create', $opValueParams);
      }
    }

    return TRUE;
  }

  public function upgrade_0008() {
    $this->executeCustomDataFile('xml/activity_custom_fields.xml');

    return TRUE;
  }

  public function upgrade_0009() {
    $this->executeCustomDataFile('xml/probation.xml');

    return TRUE;
  }

  /*
   * Enable CiviTask and CiviDocument components.
   */
  /*public function upgrade_0010()
  {
      CRM_Core_BAO_ConfigSetting::enableComponent('CiviTask');
      CRM_Core_BAO_ConfigSetting::enableComponent('CiviDocument');

      return TRUE;
  }*/

  /**
   * Install Dummy Document Types (Activity Types)
   *
   * @return bool
   */
  public function upgrade_1011() {
    $this->_installActivityTypes('CiviDocument', array(
      'Joining Document 1',
      'Exiting document 1',
    ));

    return TRUE;
  }

  /**
   * Set up Daily Reminder job
   *
   * @return bool
   */
  public function upgrade_1012() {
    $dao = new CRM_Core_DAO_Job();
    $dao->api_entity = 'task';
    $dao->api_action = 'senddailyreminder';
    $dao->find(TRUE);

    if (!$dao->id) {
      $dao = new CRM_Core_DAO_Job();
      $dao->domain_id = CRM_Core_Config::domainID();
      $dao->run_frequency = 'Daily';
      $dao->parameters = NULL;
      $dao->name = 'Tasks and Assignments Daily Reminder';
      $dao->description = 'Tasks and Assignments Daily Reminder';
      $dao->api_entity = 'task';
      $dao->api_action = 'senddailyreminder';
      $dao->is_active = 1;
      $dao->save();
    }

    return TRUE;
  }

  /**
   * Add Settings page to Tasks and Assignments top menu
   *
   * @return bool
   */
  public function upgrade_1013() {
    $taNavigation = new CRM_Core_DAO_Navigation();
    $taNavigation->name = 'tasksassignments';
    $taNavigation->find(TRUE);

    if ($taNavigation->id) {
      $taNavigation->url = '';
      $taNavigation->save();

      $submenu = array(
        array(
          'label' => ts('Dashboard'),
          'name' => 'ta_dashboard',
          'url' => 'civicrm/tasksassignments/dashboard#/tasks',
        ),
        array(
          'label' => ts('Settings'),
          'name' => 'ta_settings',
          'url' => 'civicrm/tasksassignments/settings',
        ),
      );

      foreach ($submenu as $key => $item) {
        $item['parent_id'] = $taNavigation->id;
        $item['weight'] = $key;
        $item['is_active'] = 1;

        CRM_Core_BAO_Navigation::add($item);
      }

      CRM_Core_BAO_Navigation::resetNavigation();
    }

    return TRUE;
  }

  /**
   * Add Settings page to Administer top menu
   *
   * @return bool
   */
  public function upgrade_1014() {
    // Add Tasks and Assignments to the Administer menu
    $administerNavId = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_Navigation', 'Administer', 'id', 'name');

    if ($administerNavId) {
      CRM_Core_DAO::executeQuery("DELETE FROM `civicrm_navigation` WHERE name = 'tasksassignments_administer' and parent_id = %1",
        array(
          1 => array($administerNavId, 'Integer'),
        )
      );

      $taAdminNavigation = new CRM_Core_DAO_Navigation();
      $params = array(
        'domain_id'  => CRM_Core_Config::domainID(),
        'label'      => ts('Tasks and Assignments'),
        'name'       => 'tasksassignments_administer',
        'url'        => NULL,
        'parent_id'  => $administerNavId,
        'separator'  => 1,
        'is_active'  => 1,
      );

      $taAdminNavigation->copyValues($params);
      $taAdminNavigation->save();

      $taSettings = new CRM_Core_DAO_Navigation();
      $taSettings->name = 'ta_settings';
      $taSettings->find(TRUE);

      if ($taSettings->id) {
        $taSettings->parent_id = $taAdminNavigation->id;
        $taSettings->save();
      }

      CRM_Core_BAO_Navigation::resetNavigation();
    }

    return TRUE;
  }

  public function upgrade_1015() {
    $setting = civicrm_api3('OptionValue', 'get', array(
      'option_group_id' => 'ta_settings',
      'name' => 'is_task_dashboard_default',
    ));

    if (empty($setting['id'])) {
      $opValueParams = array(
        'option_group_id' => 'ta_settings',
        'name' => 'is_task_dashboard_default',
        'label' => 'Is task dashboard the default page',
        'value' => '1',
      );
      civicrm_api3('OptionValue', 'create', $opValueParams);
    }

    return TRUE;
  }

  public function upgrade_1016() {
    CRM_Tasksassignments_DashboardSwitcher::switchToTasksAndAssignments();

    return TRUE;
  }

  /**
   * Make sure that the Tasks and Assignments main menu item
   * (and subsequently the Dashboard menu item) are restricted to only the users
   * with 'access Tasks and Assignments' permission
   */
  public function upgrade_1018() {
    $taNavigation = new CRM_Core_BAO_Navigation();
    $taNavigation->name = 'tasksassignments';
    $taNavigation->find(TRUE);

    if ($taNavigation->id && !$taNavigation->permission) {
      $navigation = new CRM_Core_BAO_Navigation();
      $foo = array(
        'id' => $taNavigation->id,
        'permission' => 'access Tasks and Assignments',
        'separator'  => 1,
        'is_active'  => 1,
      );

      $params = $navigation->add($foo);

      return TRUE;
    }

    return FALSE;
  }

  /**
   * Disables the Case menu items if Tasks&Assignments is enabled
   *
   * @return bool
   */
  public function upgrade_1019() {
    $isEnabled = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_Extension', 'uk.co.compucorp.civicrm.tasksassignments', 'is_active', 'full_name');

    if ($isEnabled) {
      CRM_Core_DAO::executeQuery("UPDATE civicrm_navigation SET is_active=0 WHERE name = 'Cases' AND parent_id IS NULL");
      CRM_Core_BAO_Navigation::resetNavigation();
    }

    return TRUE;
  }

  /**
   * Install Tasks Assignments 'days_to_create_a_document_clone' setting field.
   * It keeps a number of days to create a document clone before original
   * expiry date.
   *
   * @return bool
   */
  public function upgrade_1020() {
    $optionGroupID = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_OptionGroup', 'ta_settings', 'id', 'name');

    if (!$optionGroupID) {
      civicrm_api3('OptionGroup', 'create', array(
        'name' => 'ta_settings',
        'title' => 'Tasks and Assignments settings',
        'is_active' => 1,
        'is_reserved' => 1,
      ));
    }

    $optionValue = civicrm_api3('OptionValue', 'get', array(
      'sequential' => 1,
      'option_group_id' => 'ta_settings',
      'name' => "days_to_create_a_document_clone",
    ));

    if (empty($optionValue['id'])) {
      civicrm_api3('OptionValue', 'create', array(
        'option_group_id' => 'ta_settings',
        'name' => 'days_to_create_a_document_clone',
        'label' => is_callable('t') ? t('Renewed document creation date offset (days)') : 'Renewed document creation date offset (days)',
        'value' => 0,
      ));
    }

    return TRUE;
  }

  /**
   * Uninstalls the dummy document types in old CiviHR installs
   * And adds real, default values
   *
   * @return bool
   */
  public function upgrade_1021() {
    $this->_uninstallActivityTypes('CiviDocument', array(
      'Joining Document 1',
      'Exiting Document 1',
    ));

    $this->_installActivityTypes('CiviDocument', array(
      'VISA',
      'Passport',
      'Government Photo ID',
      'Driving licence',
      'Identity card',
      'Certificate of sponsorship (COS)',
    ));

    return TRUE;
  }

  /**
   * Set up scheduled job which clones documents on pre-set days before
   * their original expiry date.
   *
   * @see PCHR-1365
   */
  public function upgrade_1022() {
    $dao = new CRM_Core_DAO_Job();
    $dao->api_entity = 'document';
    $dao->api_action = 'clonedocuments';
    $dao->find(TRUE);

    if (!$dao->id) {
      $dao = new CRM_Core_DAO_Job();
      $dao->domain_id = CRM_Core_Config::domainID();
      $dao->run_frequency = 'Daily';
      $dao->parameters = NULL;
      $dao->name = 'Clone Documents';
      $dao->description = 'Clone any approved document within pre-set days before its original expiry date';
      $dao->api_entity = 'document';
      $dao->api_action = 'clonedocuments';
      $dao->is_active = 1;
      $dao->save();
    }

    return TRUE;
  }

  /**
   * Set up Documents Notification scheduled job.
   */
  public function upgrade_1023() {
    $dao = new CRM_Core_DAO_Job();
    $dao->api_entity = 'document';
    $dao->api_action = 'senddocumentsnotification';
    $dao->find(TRUE);

    if (!$dao->id) {
      $dao = new CRM_Core_DAO_Job();
      $dao->domain_id = CRM_Core_Config::domainID();
      $dao->run_frequency = 'Daily';
      $dao->parameters = NULL;
      $dao->name = 'Documents Notification';
      $dao->description = 'Tasks and Assignments Documents Notification';
      $dao->api_entity = 'document';
      $dao->api_action = 'senddocumentsnotification';
      $dao->is_active = 1;
      $dao->save();
    }

    return TRUE;
  }

  public function upgrade_1024() {
    $this->executeCustomDataFile('xml/activity_custom_fields.xml');

    return TRUE;
  }

  /**
   * Add new custom fields for activities
   *
   * @return bool
   */
  public function upgrade_1025() {
    $this->executeCustomDataFile('xml/activity_custom_fields.xml');

    return TRUE;
  }

  /**
   * Redo upgrade_1020 since a change in the code in v1.6.2 re-purposed it and
   * it is possible that it the option_value was not created in some cases
   */
  public function upgrade_1026() {
    return $this->upgrade_1020();
  }

  /**
   * Remove the old Dashboard submenu item
   *
   * @return bool
   */
  public function upgrade_1027() {
    $taDashboard = new CRM_Core_DAO_Navigation();
    $taDashboard->name = 'ta_dashboard';
    $taDashboard->find(TRUE);

    if (!$taDashboard->id) {
      return TRUE;
    }

    CRM_Core_BAO_Navigation::processDelete($taDashboard->id);
    CRM_Core_BAO_Navigation::resetNavigation();

    return TRUE;
  }

  /**
   * Add new submenu links
   *
   * @return bool
   */
  public function upgrade_1028() {
    $taNavigation = new CRM_Core_DAO_Navigation();
    $taNavigation->name = 'tasksassignments';
    $taNavigation->find(TRUE);

    if (!$taNavigation->id) {
      return TRUE;
    }

    $submenu = [
      [
        'label' => ts('Tasks'),
        'name' => 'ta_dashboard_tasks',
        'url' => 'civicrm/tasksassignments/dashboard#/tasks',
      ],
      [
        'label' => ts('Documents'),
        'name' => 'ta_dashboard_documents',
        'url' => 'civicrm/tasksassignments/dashboard#/documents',
      ],
      [
        'label' => ts('Calendar'),
        'name' => 'ta_dashboard_calendar',
        'url' => 'civicrm/tasksassignments/dashboard#/calendar',
      ],
      [
        'label' => ts('Key Dates'),
        'name' => 'ta_dashboard_keydates',
        'url' => 'civicrm/tasksassignments/dashboard#/key-dates',
      ]
    ];

    foreach ($submenu as $key => $item) {
      $item['parent_id'] = $taNavigation->id;
      $item['weight'] = $key;
      $item['is_active'] = 1;

      CRM_Core_BAO_Navigation::add($item);
    }

    CRM_Core_BAO_Navigation::resetNavigation();

    return TRUE;
  }

  /**
   * Rename "Tasks and Assignments" menu items to just "Tasks"
   *
   * @return bool
   */
  public function upgrade_1029() {
    $default = [];
    $paramsDashboard = ['name' => 'tasksassignments'];
    $paramsAdmin = ['name' => 'tasksassignments_administer'];

    $menuItems = [
      'dashboard' => CRM_Core_BAO_Navigation::retrieve($paramsDashboard, $default),
      'admin' => CRM_Core_BAO_Navigation::retrieve($paramsAdmin, $default)
    ];

    foreach ($menuItems as $menuItem) {
      $menuItem->label = 'Tasks';
      $menuItem->save();
    }

    CRM_Core_BAO_Navigation::resetNavigation();

    return TRUE;
  }

  /**
   * Rename "Settings" menu item to "Tasks Settings"
   *
   * @return bool
   */
  public function upgrade_1030() {
    $default = [];
    $params = ['name' => 'ta_settings'];

    $menuItem = CRM_Core_BAO_Navigation::retrieve($params, $default);
    $menuItem->label = 'Tasks Settings';
    $menuItem->save();

    CRM_Core_BAO_Navigation::resetNavigation();

    return TRUE;
  }

  /**
   * Sets icon for top-level 'Tasks and Assignments' menu item
   *
   * @return bool
   */
  public function upgrade_1031() {
    $params = [
      'name' => 'tasksassignments',
      'api.Navigation.create' => ['id' => '$value.id', 'icon' => 'crm-i fa-list-ul'],
      'parent_id' => ['IS NULL' => TRUE],
    ];
    civicrm_api3('Navigation', 'get', $params);

    return TRUE;
  }

  /**
   * Upgrade CustomGroup, setting Probation and Activity_Custom_Fields to is_reserved Yes
   *
   * @return bool
   */
  public function upgrade_1032() {
    $result = civicrm_api3('CustomGroup', 'get', [
      'sequential' => 1,
      'return' => ['id'],
      'name' => ['IN' => ['Probation', 'Activity_Custom_Fields']],
    ]);

    foreach ($result['values'] as $value) {
      civicrm_api3('CustomGroup', 'create', [
        'id' => $value['id'],
        'is_reserved' => 1,
      ]);
    }

    return TRUE;
  }

  /**
   * Update permissions and set the weight for the "Tasks" menu item.
   *
   * @return bool
   */
  public function upgrade_1033() {
    $permission = 'administer CiviCase';
    $itemsToChange = ['tasksassignments_administer', 'ta_settings'];

    // get item IDs
    $params = ['name' => ['IN' => $itemsToChange]];
    $itemsToChange = civicrm_api3('Navigation', 'get', $params);
    $itemsToChange = array_column($itemsToChange['values'], 'name', 'id');
    $tasksId = array_search('tasksassignments_administer', $itemsToChange);
    $taSettingsId = array_search('ta_settings', $itemsToChange);

    // Update permissions for settings item
    $params = ['permission' => $permission, 'id' => $taSettingsId];
    civicrm_api3('Navigation', 'create', $params);

    // Update parent weight + permission
    $params = ['id' => $tasksId, 'weight' => -97, 'permission' => $permission];
    civicrm_api3('Navigation', 'create', $params);

    return TRUE;
  }

  /**
   * Renames the case status Ongoing and Resolved to In Progress and Completed.
   *
   * @return bool
   */
  public function upgrade_1034() {
    $this->_relabelCaseStatus('Ongoing', 'In Progress');
    $this->_relabelCaseStatus('Resolved', 'Completed');

    return TRUE;
  }

  /**
   * Deletes activity types that are not needed by T&W.
   *
   * @return bool
   */
  public function upgrade_1035() {
    $this->_uninstallAllComponentActivities([
      'CiviCampaign',
      'CiviContribute',
      'CiviEvent',
      'CiviMember',
      'CiviPledge',
    ]);

    $this->_uninstallActivitiesByName([
      'Downloaded Invoice',
      'Emailed Invoice',
      'Inbound SMS',
      'SMS',
      'SMS delivery',
      'Tell a Friend',
    ]);

    $this->_uninstallActivityTypes('CiviCase', [
      'Background Check',
      'Background_Check',
      'Collate and print goals',
      'Collection of Appraisal forms',
      'Collection of appraisal paperwork',
      'Conduct appraisal',
      'Follow up on progress',
      'ID badge',
      'Interview Prospect',
      'Issue confirmation/warning letter',
      'Issue extension letter',
      'Prepare and email schedule',
      'Prepare formats',
      'Print formats',
      'Revoke access to databases',
    ]);

    $this->_uninstallActivityTypes('CiviDocument', [
      'Joining Document 2',
      'Joining Document 3',
      'Exiting document 2',
      'Exiting document 3',
    ]);

    return TRUE;
  }

  /**
   * Removes the Open Case activity type from any Case Type that contains them in one
   * of their timelines.
   *
   * @return bool
   */
  public function upgrade_1036() {
    $caseTypes = civicrm_api3('CaseType', 'get', ['sequential' => 1]);
    $needsToRemoveOpenType = FALSE;

    foreach ($caseTypes['values'] as $caseType) {
      $activitySets = $caseType['definition']['activitySets'];

      foreach ($activitySets as $setIndex => $set) {
        $openCaseIndex = array_search(self::OPEN_CASE_TYPE, array_column($set['activityTypes'], 'name'));

        if ($openCaseIndex !== FALSE) {
          $needsToRemoveOpenType = TRUE;

          // needs to unset the full path for the activity to be properly removed:
          unset($caseType['definition']['activitySets'][$setIndex]['activityTypes'][$openCaseIndex]);
        }
      }

      // Removes Open Case activities from the Case Type only if they include this activity type:
      if ($needsToRemoveOpenType) {
        civicrm_api3('CaseType', 'create', $caseType);
      }
    }

    return TRUE;
  }

  /**
   * Adds a new menu item for Activity Types under the tasks administration menu.
   *
   * @return bool
   */
  public function upgrade_1037() {
    $activityTypeMenuItem = civicrm_api3('Navigation', 'get', [
      'name' => 'task_and_document_types_administer',
    ]);

    // Create the menu item only if it doesn't exist:
    if ($activityTypeMenuItem['count'] === 0) {
      civicrm_api3('Navigation', 'create', [
        'label' => 'Task and Document Types',
        'name' => 'task_and_document_types_administer',
        'url' => 'civicrm/admin/options/activity_type?reset=1',
        'permission' => 'administer CiviCase',
        'parent_id' => 'tasksassignments_administer',
        'is_active' => 1,
      ]);
    }

    return TRUE;
  }
  
  /**
   * Sets up option values, custom group and custom field
   * for case type categorization
   *
   * @return bool
   */
  public function upgrade_1038() {
    $optionValues = civicrm_api3('OptionValue', 'get', [
      'option_group_id' => 'cg_extend_objects',
      'name' => 'civicrm_case_type'
    ]);
    if ($optionValues['count'] == 0) {
      $this->_createOptionValue();
    }
    
    $customGroups = civicrm_api3('CustomGroup', 'get', [
      'extends' => 'CaseType',
      'name' => 'case_type_category',
    ]);
    if ($customGroups['count'] == 0) {
      $this->_createCustomGroup();
    }
    
    $customFields = civicrm_api3('CustomField', 'get', [
      'custom_group_id' => 'case_type_category',
    ]);
    if ($customFields['count'] == 0) {
      $this->_createCustomField();
    }
    
    return TRUE;
  }
  
  public function uninstall() {
    CRM_Core_DAO::executeQuery("DELETE FROM `civicrm_navigation` WHERE name IN ('tasksassignments', 'ta_dashboard_tasks', 'ta_dashboard_documents', 'ta_dashboard_calendar', 'ta_dashboard_keydates', 'tasksassignments_administer', 'ta_settings')");
    CRM_Core_BAO_Navigation::resetNavigation();

    return TRUE;
  }
  
  /**
   * Creates case type option value for cg_extend_objects option group
   */
  private function _createOptionValue() {
    civicrm_api3('OptionValue', 'create', [
      'option_group_id' => 'cg_extend_objects',
      'name' => 'civicrm_case_type',
      'label' => ts('Case Type'),
      'value' => 'CaseType',
    ]);
  }
  
  /**
   * Creates case type category custom group
   */
  private function _createCustomGroup() {
    civicrm_api3('CustomGroup', 'create', [
      'title' => ts('Case Type Category'),
      'extends' => 'CaseType',
      'name' => 'case_type_category',
      'table_name' => 'civicrm_value_case_type_category'
    ]);
  }
  
  /**
   * Creates category custom field for case type category custom group
   */
  private function _createCustomField() {
    civicrm_api3('CustomField', 'create', [
      'custom_group_id' => 'case_type_category',
      'label' => 'Category',
      'name' => 'category',
      'data_type' => 'String',
      'html_type' => 'Select',
      'is_required' => 1,
      'column_name' => 'category',
      'option_values' => array('Workflow' => 'Workflow', 'Vacancy' => 'Vacancy'),
    ]);
  }

  /**
   * Returns the activity type params starting with a component name,
   * specifically it returns the option group and component id
   *
   * @param  string $component
   * @return array
   */
  private function _fetchActivityTypeParams($component) {
    $componentId = NULL;
    $componentQuery = 'SELECT id FROM civicrm_component WHERE name = %1';
    $componentParams = array(1 => array($component, 'String'));
    $componentResult = CRM_Core_DAO::executeQuery($componentQuery, $componentParams);

    if ($componentResult->fetch()) {
      $componentId = $componentResult->id;
    }

    if (!$componentId) {
      throw new Exception($component . ' Component not found.');
    }

    $optionGroupID = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_OptionGroup', 'activity_type', 'id', 'name');

    if (!$optionGroupID) {
      civicrm_api3('OptionGroup', 'create', array(
        'name' => 'activity_type',
        'title' => 'Activity Type',
        'is_active' => 1,
      ));

      $optionGroupID = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_OptionGroup', 'activity_type', 'id', 'name');
    }

    return array(
      'component_id' => $componentId,
      'option_group_id' => $optionGroupID,
    );
  }

  private function _installActivityTypes($component, array $types) {
    $params = $this->_fetchActivityTypeParams($component);

    foreach ($types as $type) {
      civicrm_api3('OptionValue', 'create', array(
        'sequential' => 1,
        'option_group_id' => $params['option_group_id'],
        'component_id' => $params['component_id'],
        'label' => $type,
        'name' => $type,
      ));
    }
  }

  /**
   * Removes activity types by using their names as reference.
   *
   * @param array $activityNames
   */
  private function _uninstallActivitiesByName(array $activityNames) {
    $result = civicrm_api3('OptionValue', 'get', [
      'sequential' => 1,
      'option_group_id' => 'activity_type',
      'name' => ['IN' => $activityNames],
      'return' => 'id'
    ]);

    foreach ($result['values'] as $activity) {
      civicrm_api3('OptionValue', 'delete', ['id' => $activity['id']]);
    }
  }

  /**
   * Uninstall (if they exist) the given activity types for the given component
   *
   * @param  string $componentName
   * @param  array $types
   */
  private function _uninstallActivityTypes($componentName, array $types) {
    $params = $this->_fetchActivityTypeParams($componentName);
    $result = civicrm_api3('OptionValue', 'get', [
      'component_id' => $params['component_id'],
      'option_group_id' => $params['option_group_id'],
      'name' => ['IN' => $types],
      'return' => 'id',
    ]);

    foreach ($result['values'] as $activity) {
      civicrm_api3('OptionValue', 'delete', ['id' => $activity['id']]);
    }
  }

  /**
   * Removes activity types by using their parent component as reference.
   *
   * @param array $componentNames
   */
  private function _uninstallAllComponentActivities(array $componentNames) {
    $result = civicrm_api3('OptionValue', 'get', [
      'option_group_id' => 'activity_type',
      'component_id' => ['IN' => $componentNames],
      'return' => 'id'
    ]);

    foreach ($result['values'] as $activity) {
      civicrm_api3('OptionValue', 'delete', ['id' => $activity['id']]);
    }
  }

  /**
   * Renames the label for a case status
   *
   * @param string $fromLabel
   * @param string $toLabel
   */
  private function _relabelCaseStatus($fromLabel, $toLabel) {
    $result = civicrm_api3('OptionValue', 'get', [
      'option_group_id.name' => 'case_status',
      'label' => $fromLabel,
      'is_reserved' => 1,
      'sequential' => 1,
      'options' => [ 'limit' => 1 ],
    ]);

    if ($result['count']) {
      civicrm_api3('OptionValue', 'create', [
        'id' => $result['values'][0]['id'],
        'label' => $toLabel
      ]);
    }
  }

}
