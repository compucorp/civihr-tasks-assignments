<?php

use CRM_Activity_Service_ActivityService as ActivityService;
use CRM_Tasksassignments_BAO_Document as Document;
use CRM_Tasksassignments_BAO_Task as Task;

class CRM_Tasksassignments_Reminder {

  const ACTIVITY_CONTACT_ASSIGNEE = 1;
  const ACTIVITY_CONTACT_CREATOR = 2;
  const ACTIVITY_CONTACT_TARGET = 3;

  private static $_activityOptions = array();
  private static $_relatedExtensions = array(
    'hrjobcontract' => false
  );
  private static $_reminderSettings = [];

  private static function setActivityOptions() {
    if (empty(self::$_activityOptions)) {
      $typeResult = civicrm_api3('Activity', 'getoptions', array(
        'field' => "activity_type_id",
      ));
      self::$_activityOptions['type'] = $typeResult['values'];

      $statusResult = civicrm_api3('Activity', 'getoptions', array(
        'field' => "activity_status_id",
      ));
      self::$_activityOptions['status'] = $statusResult['values'];
      self::$_activityOptions['document_status'] = civicrm_api3('Document', 'getoptions', array(
                'field' => "activity_status_id",
              ))['values'];
    }
  }

  private static function checkRelatedExtensions() {
    $isJobContractEnabled = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_Extension', 'org.civicrm.hrjobcontract', 'is_active', 'full_name');

    if ($isJobContractEnabled) {
      self::$_relatedExtensions['hrjobcontract'] = true;
    }
  }

  /**
   * Gets the contacts starting with the given ids
   *
   * It also chains a call to the 'Email' api and puts the value in
   * the 'email' property
   *
   * @param array $contactIds
   *
   * @return array
   */
  private static function getContactsWithEmail($contactIds) {
    $contacts = civicrm_api3('Contact', 'get', array(
      'return' => 'display_name',
      'id' => array('IN' => $contactIds),
      'api.Email.getsingle' => array(
        'contact_id' => "\$value.contact_id",
        'is_primary' => true,
        'return' => array('contact_id', 'email')
      )
    ))['values'];

    foreach ($contacts as $id => $contact) {
      $email = CRM_Utils_Array::value('email', $contact['api.Email.getsingle']);
      $contacts[$id]['email'] = $email;
      unset($contacts[$id]['api.Email.getsingle']);
    }

    return $contacts;
  }

  /**
   * Returns the links (in <a> tags), names and email of the contacts with given ids
   * It also populates an array that maps emails to contact ids
   *
   * @param array $contactIds
   * @param array $emailToContactId (by reference) Mapping between emails and contact ids
   *
   * @return array
   */
  private static function getActivityContactsDetails($contactIds, &$emailToContactId) {
    $details = array('ids' => array(), 'links' => array(), 'names' => array(), 'emails' => array());
    $contacts = self::getContactsWithEmail($contactIds);

    foreach ($contacts as $id => $contact) {
      $url = self::createContactURL($id);
      $details['ids'][] = $id;
      $details['links'][] = '<a href="' . $url . '" style="color:#42b0cb;font-weight:normal;text-decoration:underline;">' . $contact['display_name'] . '</a>';
      $details['names'][] = $contact['display_name'];
      $details['emails'][] = $contact['email'];

      if ($contact['email']) {
        $emailToContactId[$contact['email']] = $id;
      }
    }

    return $details;
  }

  /**
   * Extracts the previous assignee from the list of the activity assignees
   * Once the assignee has been found, it is removed from the original list
   *
   * @param array $assignees
   * @param int $previousAssigneeId
   *
   * @return array consists of id, link, email and name of the previous assignee
   */
  private static function extractPreviousAssignee(&$assignees, $previousAssigneeId) {
    $index = null;

    foreach ($assignees['ids'] as $i => $assigneeId) {
      if ($assigneeId == $previousAssigneeId) {
        $index = $i;
        break;
      }
    }

    if ($index === null) {
      return null;
    }

    $previousAssignee = array(
      'id' => $previousAssigneeId,
      'email' => $assignees['emails'][$index],
      'link' => $assignees['links'][$index],
      'name' => $assignees['names'][$index],
    );

    unset($assignees['ids'][$index]);
    unset($assignees['links'][$index]);
    unset($assignees['names'][$index]);
    unset($assignees['emails'][$index]);

    return $previousAssignee;
  }

  /**
   * Gets the full list of the recipients of the reminder email
   * Makes sure there are no duplicates or no empty emails in the list
   *
   * @param array $contacts
   * @param array $previousAssignee
   *
   * @return array
   */
  private static function reminderRecipients($contacts, $previousAssignee) {
    $hasSources = !empty($contacts['source']['emails']);
    $hasAssignees = !empty($contacts['assignees']['emails']);

    $assignees = $hasAssignees ? $contacts['assignees']['emails'] : [];
    $sources = $hasSources ? $contacts['source']['emails'] : [];
    $previous = $previousAssignee ? [$previousAssignee['email']] : [];

    $recipients = array_merge($assignees, $sources, $previous);

    return array_filter(array_unique($recipients));
  }

  public static function sendReminder($activityId, $notes = null, $isReminder = false, $previousAssigneeId = null, $isDelete = false) {
    self::setActivityOptions();

    $contactTypeToLabel = array(1 => 'assignees', 2 => 'source', 3 => 'targets');
    $activityContacts = array();
    $emailToContactId = array();
    $previousAssignee = null;

    foreach ($contactTypeToLabel as $type) {
      $activityContacts[$type] = array();
    }

    $activityResult = civicrm_api3('Activity', 'get', array(
      'sequential' => 1,
      'activity_id' => $activityId,
      'is_current_revision' => 1,
      'is_deleted' => 0,
    ));
    $activityResult = CRM_Utils_Array::first($activityResult['values']);

    $activityContactResult = civicrm_api3('ActivityContact', 'get', array(
      'sequential' => 1,
      'activity_id' => $activityId,
    ));

    foreach ($activityContactResult['values'] as $value) {
      $type = $contactTypeToLabel[$value['record_type_id']];
      $activityContacts[$type]['ids'][] = $value['contact_id'];
    }

    if ($previousAssigneeId !== null) {
      $activityContacts['assignees']['ids'][] = $previousAssigneeId;
    }

    foreach ($activityContacts as $type => $contacts) {
      if (empty($value) || empty($contacts)) {
        continue;
      }

      $details = self::getActivityContactsDetails($contacts['ids'], $emailToContactId);

      $activityContacts[$type]['ids'] = $details['ids'];
      $activityContacts[$type]['links'] = $details['links'];
      $activityContacts[$type]['names'] = $details['names'];
      $activityContacts[$type]['emails'] = $details['emails'];
    }

    if ($previousAssigneeId !== null) {
      $previousAssignee = self::extractPreviousAssignee($activityContacts['assignees'], $previousAssigneeId);
    }

    $template = &CRM_Core_Smarty::singleton();
    $recipients = self::reminderRecipients($activityContacts, $previousAssignee);

    foreach ($recipients as $recipient) {
      $isTask = ActivityService::isTaskComponent($activityResult['activity_type_id']);
      $contactId = $emailToContactId[$recipient];
      $activityName = implode(', ', $activityContacts['targets']['names']) . ' - ' . self::$_activityOptions['type'][$activityResult['activity_type_id']];

      $activityDueDate = null;
      if (!empty($activityResult['activity_date_time'])) {
        $activityDueDate = substr($activityResult['activity_date_time'], 0, 10);
      }

      $isAssignee = array_search($contactId, $activityContacts['assignees']['ids']) !== FALSE;
      $activityUrl = $isAssignee
        ? '/tasks-and-documents'
        : '/civicrm/activity/view?action=view&reset=1&id=' .
          $activityId .
          '&cid=&context=activity&searchContext=activity';
      $tasksButtonUrl = $isAssignee
        ? '/tasks-and-documents'
        : '/civicrm/tasksassignments/dashboard#!/tasks/all';
      $tasksButtonLabel = $isAssignee
        ? ts('See my tasks')
        : ts('See all tasks');
      $documentsButtonUrl = $isAssignee
        ? '/tasks-and-documents'
        : '/civicrm/tasksassignments/dashboard#!/documents/all';
      $documentsButtonLabel = $isAssignee
        ? ts('See my documents')
        : ts('See all documents');

      $templateBodyHTML = $template->fetchWith('CRM/Tasksassignments/Reminder/Reminder.tpl', array(
        'isReminder' => $isReminder,
        'isDelete' => $isDelete,
        'notes' => $notes,
        'activityUrl' => CIVICRM_UF_BASEURL . $activityUrl,
        'activityName' => $activityName,
        'activityType' => self::$_activityOptions['type'][$activityResult['activity_type_id']],
        'activityTargets' => implode(', ', $activityContacts['targets']['links']),
        'activityAssignee' => implode(', ', CRM_Utils_Array::value('links', $assigneeContacts, [])),
        'previousAssignee' => $previousAssignee ? $previousAssignee['link'] : null,
        'activityStatus' => self::$_activityOptions[$isTask ? 'status' : 'document_status'][$activityResult['status_id']],
        'activityDue' => $activityDueDate,
        'activitySubject' => isset($activityResult['subject']) ? $activityResult['subject'] : '',
        'activityDetails' => isset($activityResult['details']) ? $activityResult['details'] : '',
        'baseUrl' => CIVICRM_UF_BASEURL,
        'tasksButtonUrl' => CIVICRM_UF_BASEURL . $tasksButtonUrl,
        'tasksButtonLabel' => $tasksButtonLabel,
        'documentsButtonUrl' => CIVICRM_UF_BASEURL . $documentsButtonUrl,
        'documentsButtonLabel' => $documentsButtonLabel,
      ));

      if ($isDelete) {
        $subject = "Your Task ({$activityName}) is deleted";
      } else {
        $subject = $activityName;
      }
      self::send($contactId, $recipient, $subject, $templateBodyHTML);
    }

    return true;
  }

  /**
   * Sends daily digest to administrators, task creators and assignees.
   *
   * @TODO the flag `isDelete` is *not* passed as `FALSE` in this case,
   * thus the footer with buttons will never show,
   * thus there is no need to send buttons URLs or labels.
   * @SEE https://github.com/compucorp/civihr-tasks-assignments/blame/master/uk.co.compucorp.civicrm.tasksassignments/templates/CRM/Tasksassignments/Reminder/Footer.tpl#L1
   * @SEE https://github.com/compucorp/civihr-tasks-assignments/pull/17/files#diff-7145990a7ff076d1f0d966d0db9a0cffR1
   * Seems like a regression and may need to be fixed.
   *
   * @return boolean
   *   True on completion
   */
  public static function sendDailyReminder() {
    self::setActivityOptions();
    self::checkRelatedExtensions();

    $now = date('Y-m-d');
    $to = self::getNextSunday($now);

    $assigneeQuery = self::buildTaskAssigneeCreatorQuery($to);
    $otherContactsQuery = self::buildAdminsKeyDatesQuery($now, $to);

    if (!empty($otherContactsQuery)) {
      $otherContactsQuery = "UNION $otherContactsQuery";
    }

    $contactsQuery = "
      SELECT activity_ids, contact_id, email
      FROM (
        $assigneeQuery
        $otherContactsQuery
      ) AS reminder
      GROUP BY reminder.contact_id, reminder.email
    ";
    $contactsResult = CRM_Core_DAO::executeQuery($contactsQuery);

    $settings = self::getReminderSettings();
    $contactsData = [];

    while ($contactsResult->fetch()) {
      $contactsData[$contactsResult->contact_id] = [
        'contact_id' => $contactsResult->contact_id,
        'email' => $contactsResult->email,
        'activity_ids' => !empty($contactsResult->activity_ids) ? explode(',', $contactsResult->activity_ids) : []
      ];
    }
    $contactsWithActiveContracts = self::getContactsWithActiveContracts(array_column($contactsData, 'contact_id'));

    foreach($contactsData as $contactData) {
      if(!in_array($contactData['contact_id'], $contactsWithActiveContracts)){
        continue;
      }

      $reminderData = self::getContactDailyReminderData(
        $contactData['contact_id'],
        $contactData['activity_ids'],
        $to,
        $settings
      );

      if (empty(array_filter($reminderData))) {
        continue;
      }

      $templateBodyHTML = CRM_Core_Smarty::singleton()->fetchWith('CRM/Tasksassignments/Reminder/DailyReminder.tpl', [
        'reminder' => $reminderData,
        'baseUrl' => CIVICRM_UF_BASEURL,
        'settings' => $settings,
      ]);

      self::send($contactData['contact_id'], $contactData['email'], 'Daily Reminder', $templateBodyHTML);
    }

    return true;
  }

  /**
   * Returns contacts with active contracts from the list of
   * contacts passed in.  If the job contract extension is not
   * enabled the contacts passed in are returned as is.
   *
   * @param array $contactID
   *
   * @return array
   */
  private static function getContactsWithActiveContracts(array $contactID) {
    if (self::$_relatedExtensions['hrjobcontract']) {
      $result = civicrm_api3('HRJobContract', 'getcontactswithcontractsinperiod',[
        'contact_id' => ['IN' => $contactID],
      ]);

      return array_column($result['values'], 'id');
    }

    return $contactID;
  }

  /**
   * Obtains settings used to send daily reminder.
   *
   * @return array
   *   Values in TASettings entity
   */
  private static function getReminderSettings() {
    if (empty(self::$_reminderSettings)) {
      self::$_reminderSettings = civicrm_api3('TASettings', 'get');
    }

    return self::$_reminderSettings['values'];
  }

  /**
   * Obtains list of components to be included in reminder.
   *
   * @return array
   *   List of components
   */
  private static function getReminderComponents() {
    $settings = self::getReminderSettings();

    $components = array("'CiviTask'");
    if ($settings['documents_tab']['value']) {
      $components[] = "'CiviDocument'";
    }

    return $components;
  }

  /**
   * Given a date in 'yyyy-mm-dd' format, calculates the date of next sunday.
   *
   * @param string $now
   *   Date in 'yyyy-mm-dd' format from which to do the calculation
   *
   * @return string
   *   Date in 'yyyy-mm-dd' format of next sunday, as calculated from $now
   */
  private static function getNextSunday($now) {
    $nbDay = date('N', strtotime($now));
    $sunday = new DateTime($now);
    $sunday->modify('+' . (7 - $nbDay) . ' days');

    return $sunday->format('Y-m-d');
  }

  /**
   * Returns contact ID's for users with the 'administrator' or 'HR Admin'
   * roles.
   *
   * @return array
   *   List of contact ID's
   */
  private static function getAdminContactIds() {
    $adminRole = user_role_load_by_name('administrator');
    $civihrAdminRole = user_role_load_by_name('HR Admin');

    $query = '
      SELECT ur.uid
      FROM {users_roles} AS ur
      WHERE ur.rid IN (:admin, :civi)
    ';
    $queryParams = [
      ':admin' => $adminRole->rid,
      ':civi' => $civihrAdminRole->rid
    ];

    $result = db_query($query, $queryParams);
    $uids = $result->fetchCol();
    $contactIDs = [];

    if (empty($uids)) {
      return $contactIDs;
    }

    $params = ['uf_id' => ['IN' => $uids]];
    $ufMatches = civicrm_api3('UFMatch', 'get', $params)['values'];

    if (count($ufMatches) < 1) {
      return $ufMatches;
    }

    return array_column($ufMatches, 'contact_id');
  }

  /**
   * Builds query to obtain assignee and creator contact ID's for tasks due
   * before the given date.
   *
   * @param string $to
   *   Date until where tasks should be searched, in yyyy-mm-dd format
   *
   * @return string
   *   Query to obtain task assignees and creators.
   */
  private static function buildTaskAssigneeCreatorQuery($to) {
    $components = self::getReminderComponents();
    $excludeCompletedActivities = self::getCompletedActivitiesExclusionQuery();

    return "
      SELECT GROUP_CONCAT( a.id ) AS activity_ids, ac.contact_id, e.email
      FROM `civicrm_activity` a
      LEFT JOIN civicrm_activity_contact ac ON ac.activity_id = a.id
      LEFT JOIN civicrm_email e ON e.contact_id = ac.contact_id
      LEFT JOIN civicrm_location_type lt ON e.location_type_id = lt.id
      WHERE (
        activity_date_time <= '$to'
        AND $excludeCompletedActivities
        AND ac.record_type_id IN ( 1, 2 )
        AND e.is_primary = 1
        AND lt.name = 'Work'
        AND a.activity_type_id IN (
          SELECT value
          FROM civicrm_option_value ov
          LEFT JOIN civicrm_option_group og ON ov.option_group_id = og.id
          LEFT JOIN civicrm_component co ON ov.component_id = co.id
          WHERE og.name = 'activity_type'
          AND co.name IN (
            " . implode(', ', $components) . "
          )
        )
      )
      GROUP BY e.contact_id
    ";
  }

  /**
   * Builds query to obtain contact ID's for the following:
   *
   *   - Users with administrator or HR Admin roles
   *   - Contacts with key dates in given time period
   *
   * @param string $now
   *   Date from where key dates should be searched, yyyy-mm-dd
   * @param string $to
   *   Date until where key dates should be searched, yyyy-mm-dd
   *
   * @return string
   *   Query to obtain contact ID's for admins and contacts involved in key
   *   dates
   */
  private static function buildAdminsKeyDatesQuery($now, $to) {
    $adminContacts = self::getAdminContactIds();
    $keyDatesContacts = CRM_Tasksassignments_KeyDates::getContactIds($now, $to);

    $contacts = array_merge($adminContacts, $keyDatesContacts);

    if (!empty($contacts)) {
      return '
        SELECT NULL AS activity_ids, e.contact_id, e.email
        FROM civicrm_email e
        LEFT JOIN civicrm_location_type lt
        ON e.location_type_id = lt.id
        WHERE (
          e.contact_id IN (' . implode(',', $contacts) . ')
          AND e.is_primary = 1
          AND lt.name = "Work"
        )
        GROUP BY e.contact_id
      ';
    }

    return '';
  }

  private static function getContactDailyReminderData($contactId, array $activityIds, $to, array $settings) {
    self::checkRelatedExtensions();

    $reminderData = array(
      'overdue' => array(),
      'today_mine' => array(),
      'today_others' => array(),
      'coming_up' => array(),
      'upcoming_keydates' => array(),
    );
    $keyDateLabels = array(
      'period_start_date' => ts('Contract start date'),
      'period_end_date' => ts('Contract end date'),
      'initial_join_date' => ts('Initial join date'),
      'probation_end_date' => ts('Probation end date'),
      'final_termination_date' => ts('Final termination date'),
      'birth_date' => ts('Birthday'),
    );
    $now = date('Y-m-d');

    if (!empty($activityIds)) {
      $activityQuery = "SELECT a.id, a.activity_type_id, a.status_id,
        DATE(a.activity_date_time) AS activity_date,
        DATE(acf.expire_date) AS expire_date,
        GROUP_CONCAT(ac.record_type_id,  ':', ac.contact_id,  ':', contact.display_name SEPARATOR  '|') AS activity_contact,
        ca.case_id, case_type.title AS case_type
        FROM `civicrm_activity` a
        LEFT JOIN civicrm_activity_contact ac ON ac.activity_id = a.id
        LEFT JOIN civicrm_case_activity ca ON ca.activity_id = a.id
        LEFT JOIN civicrm_contact contact ON contact.id = ac.contact_id
        LEFT JOIN civicrm_case tcase ON tcase.id = ca.case_id
        LEFT JOIN civicrm_case_type case_type ON case_type.id = tcase.case_type_id
        LEFT JOIN civicrm_value_activity_custom_fields_11 acf ON acf.entity_id = a.id
        WHERE a.id IN (" . implode(',', $activityIds) . ")
        GROUP BY a.id";

      $activityResult = CRM_Core_DAO::executeQuery($activityQuery);
      while ($activityResult->fetch()) {
        $activityContact = array(
          self::ACTIVITY_CONTACT_ASSIGNEE => array(),
          self::ACTIVITY_CONTACT_CREATOR => array(),
          self::ACTIVITY_CONTACT_TARGET => array(),
        );

        $activityContactRow = explode('|', $activityResult->activity_contact);
        foreach ($activityContactRow as $value) {
          list($type, $cId, $cSortName) = explode(':', $value);
          $contactUrl = self::createContactURL($cId);
          $activityContact[$type][$cId] = '<a href="' . $contactUrl . '" style="color:#42b0cb;font-weight:normal;text-decoration:underline;">' . $cSortName . '</a>';
        }

        $reminderKey = null;
        if (array_key_exists($contactId, $activityContact[self::ACTIVITY_CONTACT_ASSIGNEE])) {
          if ($activityResult->expire_date === $now) {
            $reminderKey = 'today_mine';
          } elseif ($activityResult->expire_date > $now) {
            $reminderKey = 'coming_up';
          } elseif ($activityResult->activity_date < $now) {
            $reminderKey = 'overdue';
          } elseif ($activityResult->activity_date > $now) {
            $reminderKey = 'coming_up';
          } else {
            $reminderKey = 'today_mine';
          }
        } elseif (array_key_exists($contactId, $activityContact[self::ACTIVITY_CONTACT_CREATOR]) && ($activityResult->activity_date === $now || $activityResult->expire_date === $now)) {
          $reminderKey = 'today_others';
        }

        // Fill the $reminderData array:
        if ($reminderKey) {
          $isTask = ActivityService::isTaskComponent($activityResult->activity_type_id);
          $reminderData[$reminderKey][] = array(
            'id' => $activityResult->id,
            'activityUrl' => self::createActivityURL($contactId, $activityResult->id),
            'typeId' => $activityResult->activity_type_id,
            'type' => self::$_activityOptions['type'][$activityResult->activity_type_id],
            'statusId' => $activityResult->status_id,
            'status' => ucfirst(self::$_activityOptions[$isTask ? 'status' : 'document_status'][$activityResult->status_id]),
            'targets' => $activityContact[self::ACTIVITY_CONTACT_TARGET],
            'assignee' => $activityContact[self::ACTIVITY_CONTACT_ASSIGNEE],
            'caseId' => $activityResult->case_id,
            'caseType' => $activityResult->case_type,
            'date' => date("M d", strtotime($activityResult->activity_date)),
          );
        }
      }
    }

    $todayKeydatesCount = 0;
    if ($settings['keydates_tab']['value'] && self::canSeeKeyDates($contactId)) {
      $keyDates = CRM_Tasksassignments_KeyDates::get($now, $to);
      foreach ($keyDates as $keyDate) {
        $reminderData['upcoming_keydates'][] = array_merge(
                $keyDate, array(
          'label' => $keyDateLabels[$keyDate['type']],
                )
        );
        if ($keyDate['keydate'] == $now) {
          $todayKeydatesCount++;
        }
      }
    }
    $reminderData['today_keydates_count'] = $todayKeydatesCount;

    return $reminderData;
  }

  /**
   * Check if given Contact ID is allowed to see Key Dates section
   * in Dayly Reminder email. As being said in PCHR-1149 it requires
   * Administrator role.
   *
   * @param int $contactId
   * @return boolean
   */
  public static function canSeeKeyDates($contactId) {
    $ufMatch = civicrm_api3('UFMatch', 'get', array(
      'sequential' => 1,
      'contact_id' => $contactId,
      'return' => 'uf_id',
    ));
    $ufMatchContact = CRM_Utils_Array::first($ufMatch['values']);
    if (empty($ufMatchContact['uf_id'])) {
      return FALSE;
    }

    $user = user_load($ufMatchContact['uf_id']);
    if (in_array('administrator', $user->roles) || in_array('HR Admin', $user->roles)) {
      return TRUE;
    }

    return FALSE;
  }

  /**
   * Check if given Contact ID has access to required permission to create
   * activityURL.
   *
   * @param int $contactId
   * @return string
   */
  public static function createActivityURL($contactId = NULL, $activityResultId = NULL) {

    if ($contactId) {
      $drupal_user = user_load(self::getUfMatchContact($contactId)['uf_id']);

      if (user_access('access CiviCRM', $drupal_user)) {
        $activityUrl = CIVICRM_UF_BASEURL . '/civicrm/activity/view?action=view&reset=1&id=' . $activityResultId . '&cid=' . $contactId . '&context=activity&searchContext=activity';
      }
      else {
        $activityUrl = CIVICRM_UF_BASEURL . '/dashboard';
      }
      return $activityUrl;
    }
    return '';
  }

  /**
   * Check if given Contact ID has access to required permission to create
   * contactURL.
   *
   * @param int $contactId
   * @return string
   */
  public static function createContactURL($contactId = NULL) {

    if ($contactId) {
      $drupal_user = user_load(self::getUfMatchContact($contactId)['uf_id']);

      if (user_access('access CiviCRM', $drupal_user)) {
        $contactUrl = CIVICRM_UF_BASEURL . '/civicrm/contact/view?reset=1&cid=' . $contactId;
      }
      else {
        $contactUrl = CIVICRM_UF_BASEURL . '/dashboard';
      }
      return $contactUrl;
    }
    return '';
  }

  /**
   * Sends out daily email notifications for documents including separate lists
   * with:
   * - Overdue documents (!= approved)
   * - Due in next fortnight (14 days) (!= approved)
   * - Due in < 90 days (!= approved)
   * and show status in email.
   *
   * Acceptance criteria:
   * - Emails are sent out to assignees only.
   * - Assignee contact receives lists of documents he/she is assigned to only.
   * - Documents are grouped by due date according to the logic described
   *   in the task description (@see PCHR-1362).
   *
   * Returns a number of emails sent.
   *
   * @return int
   */
  public static function sendDocumentsNotifications() {
    self::setActivityOptions();
    $count = 0;
    $taSettings = civicrm_api3('TASettings', 'get');
    $settings = $taSettings['values'];
    $notifications = self::getDocumentNotificationsData();
    $tasksAndDocumentsButtonUrl = CIVICRM_UF_BASEURL . '/tasks-and-documents';

    foreach ($notifications as $assignee => $documentsSet) {
      list($assigneeId, $assigneeEmail) = explode(':', $assignee);
      $templateBodyHTML = CRM_Core_Smarty::singleton()->fetchWith('CRM/Tasksassignments/Reminder/DailyDocumentsNotification.tpl', array(
        'notification' => $documentsSet,
        'baseUrl' => CIVICRM_UF_BASEURL,
        'tasksButtonUrl' => $tasksAndDocumentsButtonUrl,
        'tasksButtonLabel' => ts('See my tasks'),
        'documentsButtonUrl' => $tasksAndDocumentsButtonUrl,
        'documentsButtonLabel' => ts('See my documents'),
        'settings' => $settings,
      ));

      if (self::send($assigneeId, $assigneeEmail, ts('Documents Notification'), $templateBodyHTML)) {
        $count++;
      }
    }

    return $count;
  }

  /**
   * Return an array containing a set of Documents for each Assignee
   * grouped by due date period ('overdue' - overdue, 'plus14' - due date
   * within next 14 days, 'plus90' - due date within next 90 days).
   *
   * @return array
   */
  protected static function getDocumentNotificationsData() {
    $today = new DateTime();
    $todayPlus14 = (new DateTime())->add(new DateInterval('P14D'));
    $todayPlus90 = (new DateTime())->add(new DateInterval('P90D'));
    $notifications = array();

    $activityResult = self::queryDbForDocumentsNotificationData($todayPlus90);
    while ($activityResult->fetch()) {
      $activityContact = self::getExtractedActivityContacts($activityResult->activity_contact);
      $dueDate = (new DateTime())->createFromFormat('Y-m-d', $activityResult->activity_date);
      $assigneeId = $activityContact[self::ACTIVITY_CONTACT_ASSIGNEE]['id'];
      if (empty($assigneeId)) {
        continue;
      }
      $dueIndex = 'overdue';
      if ($dueDate->format('Y-m-d') >= $today->format('Y-m-d')) {
        $dueIndex = 'plus14';
      }
      if ($dueDate->format('Y-m-d') >= $todayPlus14->format('Y-m-d')) {
        $dueIndex = 'plus90';
      }
      $key = $assigneeId . ':' . $activityContact[self::ACTIVITY_CONTACT_ASSIGNEE]['email'];
      $notifications[$key][$dueIndex][] = self::getDocumentNotificationTemplateValues($activityResult, $activityContact);
    }

    return $notifications;
  }

  /**
   * Return CRM_Core_DAO object with database results containing data
   * needed for create a Documents Notification emails.
   *
   * @param DateTime $upToDate
   * @return CRM_Core_DAO
   */
  protected static function queryDbForDocumentsNotificationData(DateTime $upToDate) {
    $activityQuery = "SELECT a.id, a.activity_type_id, a.status_id, DATE(a.activity_date_time) AS activity_date,
        GROUP_CONCAT(ac.record_type_id, ':', ac.contact_id, ':', contact.display_name, ':', e.email SEPARATOR  %1) AS activity_contact
        FROM `civicrm_activity` a
        LEFT JOIN civicrm_activity_contact ac ON ac.activity_id = a.id
        LEFT JOIN civicrm_contact contact ON contact.id = ac.contact_id
        LEFT JOIN civicrm_email e ON e.contact_id = ac.contact_id AND e.is_primary = 1
        WHERE a.status_id <> %2 AND
          DATE(a.activity_date_time) <= %3 AND
          a.activity_type_id IN (
            SELECT value
            FROM civicrm_option_value ov
            LEFT JOIN civicrm_option_group og ON ov.option_group_id = og.id
            LEFT JOIN civicrm_component co ON ov.component_id = co.id
            WHERE og.name = 'activity_type'
            AND co.name = 'CiviDocument'
          )
        GROUP BY a.id
        ORDER BY a.id";
    $activityParams = array(
      1 => array(CRM_Core_DAO::VALUE_SEPARATOR, 'String'),
      2 => array(CRM_Tasksassignments_BAO_Document::STATUS_APPROVED, 'Integer'),
      3 => array($upToDate->format('Y-m-d'), 'String'),
    );
    return CRM_Core_DAO::executeQuery($activityQuery, $activityParams);
  }

  /**
   * Extracts data from a single row containing concatenated database values into
   * array containing three contact types (Creator, Assignee and Target).
   *
   * @param string $activityContactsData
   * @return array
   */
  protected static function getExtractedActivityContacts($activityContactsData) {
    $result = array(
      self::ACTIVITY_CONTACT_CREATOR => array(),
      self::ACTIVITY_CONTACT_ASSIGNEE => array(),
      self::ACTIVITY_CONTACT_TARGET => array(),
    );
    $activityContactRows = explode(CRM_Core_DAO::VALUE_SEPARATOR, $activityContactsData);

    foreach ($activityContactRows as $value) {
      list($type, $contactId, $contactDisplayName, $email) = explode(':', $value);
      $result[$type] = array(
        'id' => $contactId,
        'url' => CIVICRM_UF_BASEURL . '/civicrm/contact/view?reset=1&cid=' . $contactId,
        'displayName' => $contactDisplayName,
        'email' => $email,
      );
    }

    return $result;
  }

  /**
   * Return an array containing a set of single Document fields needed for
   * list the Document in notification template.
   *
   * @param CRM_Core_DAO $activityResult
   * @param array $activityContact
   *
   * @return array
   */
  protected static function getDocumentNotificationTemplateValues(CRM_Core_DAO $activityResult, array $activityContact) {
    return array(
      'id' => $activityResult->id,
      'activityUrl' => CIVICRM_UF_BASEURL . '/civicrm/activity/view?action=view&reset=1&id=' . $activityResult->id . '&cid=&context=activity&searchContext=activity',
      'typeId' => $activityResult->activity_type_id,
      'type' => self::$_activityOptions['type'][$activityResult->activity_type_id],
      'statusId' => $activityResult->status_id,
      'status' => self::$_activityOptions['document_status'][$activityResult->status_id],
      'source' => $activityContact[self::ACTIVITY_CONTACT_CREATOR],
      'target' => $activityContact[self::ACTIVITY_CONTACT_TARGET],
      'assignee' => $activityContact[self::ACTIVITY_CONTACT_ASSIGNEE],
      'date' => (new DateTime())->createFromFormat('Y-m-d', $activityResult->activity_date)->format('M d'),
    );
  }

  /**
   * @param int $contactId
   * @param string $email
   * @param string $template
   * @param string $html
   *
   * @return bool
   */
  private static function send($contactId, $email, $body_subject, $body_html) {
    $domain = CRM_Core_BAO_Domain::getDomain();
    $result = false;
    $hookTokens = array();

    $domainValues = array();
    $domainValues['name'] = CRM_Utils_Token::getDomainTokenReplacement('name', $domain);

    $domainValue = CRM_Core_BAO_Domain::getNameAndEmail();
    $domainValues['email'] = $domainValue[1];
    $receiptFrom = '"' . $domainValues['name'] . '" <' . $domainValues['email'] . '>';

    $body_text = CRM_Utils_String::htmlToText($body_html);

    $params = array(array('contact_id', '=', $contactId, 0, 0));
    list($contact, $_) = CRM_Contact_BAO_Query::apiQuery($params);

    $contact = reset($contact);

    if (!$contact || is_a($contact, 'CRM_Core_Error')) {
      return NULL;
    }

    // get tokens to be replaced
    $tokens = array_merge(CRM_Utils_Token::getTokens($body_text), CRM_Utils_Token::getTokens($body_html), CRM_Utils_Token::getTokens($body_subject));

    // get replacement text for these tokens
    $returnProperties = array("preferred_mail_format" => 1);
    if (isset($tokens['contact'])) {
      foreach ($tokens['contact'] as $key => $value) {
        $returnProperties[$value] = 1;
      }
    }
    list($details) = CRM_Utils_Token::getTokenDetails(array($contactId), $returnProperties, null, null, false, $tokens, 'CRM_Core_BAO_MessageTemplate');
    $contact = reset($details);

    // call token hook
    $hookTokens = array();
    CRM_Utils_Hook::tokens($hookTokens);
    $categories = array_keys($hookTokens);

    // do replacements in text and html body
    $type = array('html', 'text');
    foreach ($type as $key => $value) {
      $bodyType = "body_{$value}";
      if ($$bodyType) {
        CRM_Utils_Token::replaceGreetingTokens($$bodyType, NULL, $contact['contact_id']);
        $$bodyType = CRM_Utils_Token::replaceDomainTokens($$bodyType, $domain, true, $tokens, true);
        $$bodyType = CRM_Utils_Token::replaceContactTokens($$bodyType, $contact, false, $tokens, false, true);
        $$bodyType = CRM_Utils_Token::replaceComponentTokens($$bodyType, $contact, $tokens, true);
        $$bodyType = CRM_Utils_Token::replaceHookTokens($$bodyType, $contact, $categories, true);
      }
    }
    $html = $body_html;
    $text = $body_text;

    $smarty = CRM_Core_Smarty::singleton();
    foreach (array('text', 'html') as $elem) {
      $$elem = $smarty->fetch("string:{$$elem}");
    }

    // do replacements in message subject
    $messageSubject = CRM_Utils_Token::replaceContactTokens($body_subject, $contact, false, $tokens);
    $messageSubject = CRM_Utils_Token::replaceDomainTokens($messageSubject, $domain, true, $tokens);
    $messageSubject = CRM_Utils_Token::replaceComponentTokens($messageSubject, $contact, $tokens, true);
    $messageSubject = CRM_Utils_Token::replaceHookTokens($messageSubject, $contact, $categories, true);

    $messageSubject = $smarty->fetch("string:{$messageSubject}");

    // set up the parameters for CRM_Utils_Mail::send
    $mailParams = array(
      'groupName' => 'Scheduled Reminder Sender',
      'from' => $receiptFrom,
      'toName' => !empty($contact['display_name']) ? $contact['display_name'] : $email,
      'toEmail' => $email,
      'subject' => $messageSubject,
    );
    if (!$html || $contact['preferred_mail_format'] == 'Text' ||
            $contact['preferred_mail_format'] == 'Both'
    ) {
      // render the &amp; entities in text mode, so that the links work
      $mailParams['text'] = str_replace('&amp;', '&', $text);
    }
    if ($html && ($contact['preferred_mail_format'] == 'HTML' ||
            $contact['preferred_mail_format'] == 'Both'
            )) {
      $mailParams['html'] = $html;
    }

    $result = CRM_Utils_Mail::send($mailParams);

    return $result;
  }

  /**
   * Loads civicrm_uf_match data based on passed contact_id
   *
   * @param int $contact_id
   *
   * @return mixed
   *
   * @throws CiviCRM_API3_Exception
   */
  private static function getUfMatchContact($contact_id) {
    $params = [
      'contact_id' => $contact_id,
      'version' => 3,
      'sequential' => 1,
    ];

    // Get the "civicrm_uf_match" data from the passed target contact ID
    $res = civicrm_api3('UFMatch', 'Get', $params);
    $uf_match_data = array_shift($res['values']);

    return $uf_match_data;
  }

  /**
   * Constructs a query condition that excludes "completed" activities.
   *
   * @return string
   */
  private static function getCompletedActivitiesExclusionQuery() {
    $documentIncompleteStatuses = implode(',', Document::getIncompleteStatuses());
    $documentTypesIds = implode(',', ActivityService::getTypesIdsForComponent('CiviDocument'));
    $taskIncompleteStatuses = implode(',', Task::getIncompleteStatuses());
    $taskTypesIds = implode(',', ActivityService::getTypesIdsForComponent('CiviTask'));

    return "(
      (
        a.status_id IN ($documentIncompleteStatuses)
        AND a.activity_type_id IN ($documentTypesIds)
      )
      OR
      (
        a.status_id IN ($taskIncompleteStatuses)
        AND a.activity_type_id IN ($taskTypesIds)
      )
    )";
  }

}
