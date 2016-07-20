<?php

class CRM_Tasksassignments_Reminder
{
    const ACTIVITY_CONTACT_ASSIGNEE = 1;
    const ACTIVITY_CONTACT_CREATOR = 2;
    const ACTIVITY_CONTACT_TARGET = 3;

    private static $_activityOptions = array();
    private static $_relatedExtensions = array(
        'appraisals' => false,
    );

    private static function _setActivityOptions()
    {
        if (empty(self::$_activityOptions))
        {
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

    private static function _checkRelatedExtensions()
    {
        $appraisalExtension = CRM_Core_DAO::executeQuery("SELECT id FROM civicrm_extension WHERE full_name = 'uk.co.compucorp.civicrm.appraisals' AND is_active = 1 LIMIT 1");
        $appraisalExtension->fetch();
        if ($appraisalExtension->id)
        {
            self::$_relatedExtensions['appraisals'] = true;
        }
    }

    /**
     * Gets the contacts starting with the given ids
     *
     * It also chains a call to the 'Email' api and puts the value in
     * the 'email' property
     *
     * @param array $contactIds
     * @return array
     */
    private static function _getContactsWithEmail($contactIds) {
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
            $contacts[$id]['email'] = $contact['api.Email.getsingle']['email'];
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
     * @return array
     */
    private static function _getActivityContactsDetails($contactIds, &$emailToContactId) {
        $details = array('ids' => array(), 'links' => array(), 'names' => array(), 'emails' => array());
        $contacts = self::_getContactsWithEmail($contactIds);

        foreach ($contacts as $id => $contact) {
            $url = CIVICRM_UF_BASEURL . '/civicrm/contact/view?reset=1&cid=' . $id;

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
     * @return array consists of id, link, email and name of the previous assignee
     */
    private static function _extractPreviousAssignee(&$assignees, $previousAssigneeId) {
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
     * @param array $activityContacts
     * @param array $previousAssignee
     * @return array
     */
    private static function _reminderRecipients($activityContacts, $previousAssignee) {
        return array_filter(array_unique(array_merge(
            $activityContacts['assignees']['emails'],
            $activityContacts['source']['emails'],
            [$previousAssignee['email']]
        )));
    }


    public static function sendReminder($activityId, $notes = null, $isReminder = false, $previousAssigneeId = null, $isDelete = false)
    {
        self::_setActivityOptions();

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

        foreach ($activityContactResult['values'] as $value)
        {
            $type = $contactTypeToLabel[$value['record_type_id']];
            $activityContacts[$type]['ids'][] = $value['contact_id'];
        }

        if ($previousAssigneeId !== null)
        {
            $activityContacts['assignees']['ids'][] = $previousAssigneeId;
        }

        foreach ($activityContacts as $type => $contacts)
        {
            if (empty($value))
            {
                continue;
            }

            $details = self::_getActivityContactsDetails($contacts['ids'], $emailToContactId);

            $activityContacts[$type]['ids'] = $details['ids'];
            $activityContacts[$type]['links'] = $details['links'];
            $activityContacts[$type]['names'] = $details['names'];
            $activityContacts[$type]['emails'] = $details['emails'];
        }

        if ($previousAssigneeId !== null) {
            $previousAssignee = self::_extractPreviousAssignee($activityContacts['assignees'], $previousAssigneeId);
        }

        $template = &CRM_Core_Smarty::singleton();
        $recipients = self::_reminderRecipients($activityContacts, $previousAssignee);

        foreach ($recipients as $recipient)
        {
            $isTask = isset($activityResult['subject']);
            $contactId = $emailToContactId[$recipient];
            $activityName = implode(', ', $activityContacts['targets']['names']) . ' - ' . self::$_activityOptions['type'][$activityResult['activity_type_id']];
            $templateBodyHTML = $template->fetchWith('CRM/Tasksassignments/Reminder/Reminder.tpl', array(
                'isReminder' => $isReminder,
                'isDelete' => $isDelete,
                'notes' => $notes,
                'activityUrl' => CIVICRM_UF_BASEURL . '/civicrm/activity/view?action=view&reset=1&id=' . $activityId . '&cid=&context=activity&searchContext=activity',
                'activityName' => $activityName,
                'activityType' => self::$_activityOptions['type'][$activityResult['activity_type_id']],
                'activityTargets' => implode(', ', $activityContacts['targets']['links']),
                'activityAssignee' => implode(', ', $activityContacts['assignees']['links']),
                'previousAssignee' => $previousAssignee ? $previousAssignee['link'] : null,
                'activityStatus' => self::$_activityOptions[$isTask ? 'status': 'document_status'][$activityResult['status_id']],
                'activityDue' => substr($activityResult['activity_date_time'], 0, 10),
                'activitySubject' => isset($activityResult['subject']) ? $activityResult['subject'] : '',
                'activityDetails' => isset($activityResult['details']) ? $activityResult['details'] : '',
                'baseUrl' => CIVICRM_UF_BASEURL,
                'myTasksUrl' => CIVICRM_UF_BASEURL . '/civicrm/tasksassignments/my-tasks',
                'myDocumentsUrl' => CIVICRM_UF_BASEURL . '/civicrm/tasksassignments/my-documents',
            ));

            if($isDelete){
                $subject = "Your Task ({$activityName}) is deleted";
            }else{
                $subject = $activityName;
            }
            self::_send($contactId, $recipient, $subject, $templateBodyHTML);
        }

        return true;
    }

    public static function sendDailyReminder()
    {
        self::_setActivityOptions();
        self::_checkRelatedExtensions();

        $taSettings = civicrm_api3('TASettings', 'get');
        $settings = $taSettings['values'];
        $components = array("'CiviTask'");
        if ($settings['documents_tab']['value'])
        {
            $components[] = "'CiviDocument'";
        }

        $incompleteStatuses = array();
        $incompleteStatusesResult = civicrm_api3('Task', 'getstatuses', array(
            'sequential' => 1,
            'grouping' => array('IS NULL' => 1),
        ));
        foreach ($incompleteStatusesResult['values'] as $value)
        {
            $incompleteStatuses[] = $value['value'];
        }

        $now = date('Y-m-d');
        $nbDay = date('N', strtotime($now));
        $sunday = new DateTime($now);
        $sunday->modify('+' . (7 - $nbDay) . ' days');

        $to = $sunday->format('Y-m-d');

        $keyDatesContacts = CRM_Tasksassignments_KeyDates::getContactIds($now, $to);

        $appraisalsContacts = array();
        if (self::$_relatedExtensions['appraisals'])
        {
            $appraisalsContacts = CRM_Appraisals_Reminder::getContactIds($now, $to);
        }

        $contactsQuery = "SELECT activity_ids, contact_id, email
            FROM (
            SELECT GROUP_CONCAT( a.id ) AS activity_ids, ac.contact_id, e.email
            FROM `civicrm_activity` a
            LEFT JOIN civicrm_activity_contact ac ON ac.activity_id = a.id
            LEFT JOIN civicrm_email e ON e.contact_id = ac.contact_id
            WHERE (
            activity_date_time <= %1
            AND a.status_id
            IN (" . implode(',', $incompleteStatuses) . ")
            AND ac.record_type_id
            IN ( 1, 2 )
            AND e.is_primary =1
            AND a.activity_type_id
            IN (
            SELECT value
            FROM civicrm_option_value ov
            LEFT JOIN civicrm_option_group og ON ov.option_group_id = og.id
            LEFT JOIN civicrm_component co ON ov.component_id = co.id
            WHERE og.name = 'activity_type'
            AND co.name
            IN (
            " . implode(',', $components) . "
            )
            )
            )
            GROUP BY e.contact_id
            ";
        if (!empty($keyDatesContacts))
        {
            $contactsQuery .= "UNION
            SELECT NULL AS activity_ids, e.contact_id, e.email
            FROM `civicrm_email` e
            WHERE (
            e.contact_id
            IN (" . implode(',', $keyDatesContacts) . ")
            )
            GROUP BY e.contact_id
            ";
        }
        if (!empty($appraisalsContacts))
        {
            $contactsQuery .= "UNION
            SELECT NULL AS activity_ids, e.contact_id, e.email
            FROM `civicrm_email` e
            WHERE (
            e.contact_id
            IN (" . implode(',', $appraisalsContacts) . ")
            )
            GROUP BY e.contact_id
            ";
        }
        $contactsQuery .= ") AS reminder
            GROUP BY reminder.contact_id
            ";

        $contactsParams = array(
            1 => array($to, 'String'),
        );

        $contactsResult = CRM_Core_DAO::executeQuery($contactsQuery, $contactsParams);
        while ($contactsResult->fetch())
        {
            $reminderData = self::_getContactDailyReminderData($contactsResult->contact_id, !empty($contactsResult->activity_ids) ? explode(',', $contactsResult->activity_ids) : array(), $to, $settings);
            $templateBodyHTML = CRM_Core_Smarty::singleton()->fetchWith('CRM/Tasksassignments/Reminder/DailyReminder.tpl', array(
                'reminder' => $reminderData,
                'baseUrl' => CIVICRM_UF_BASEURL,
                'myTasksUrl' => CIVICRM_UF_BASEURL . '/civicrm/tasksassignments/dashboard#/tasks/my',
                'myDocumentsUrl' => CIVICRM_UF_BASEURL . '/civicrm/tasksassignments/dashboard#/documents/my',
                'settings' => $settings,
            ));
            self::_send($contactsResult->contact_id, $contactsResult->email, 'Daily Reminder', $templateBodyHTML);
        }

        return true;
    }

    private static function _getContactDailyReminderData($contactId, array $activityIds, $to, array $settings)
    {
        self::_checkRelatedExtensions();

        $reminderData = array(
            'overdue' => array(),
            'today_mine' => array(),
            'today_others' => array(),
            'coming_up' => array(),
            'upcoming_keydates' => array(),
        );
        $keyDateLabels = array(
            'period_start_date' => 'Period start date',
            'period_end_date' => 'Period end date',
            'initial_join_date' => 'Initial join date',
            'final_termination_date' => 'Final termination date',
            'birth_date' => 'Birthday',
        );
        $now = date('Y-m-d');

        if (!empty($activityIds))
        {
            $activityQuery = "SELECT a.id, a.activity_type_id, a.status_id, DATE(a.activity_date_time) AS activity_date,
            GROUP_CONCAT(ac.record_type_id,  ':', ac.contact_id,  ':', contact.display_name SEPARATOR  '|') AS activity_contact,
            ca.case_id,
            case_type.title AS case_type
            FROM `civicrm_activity` a
            LEFT JOIN civicrm_activity_contact ac ON ac.activity_id = a.id
            LEFT JOIN civicrm_case_activity ca ON ca.activity_id = a.id
            LEFT JOIN civicrm_contact contact ON contact.id = ac.contact_id
            LEFT JOIN civicrm_case tcase ON tcase.id = ca.case_id
            LEFT JOIN civicrm_case_type case_type ON case_type.id = tcase.case_type_id
            WHERE a.id IN (" . implode(',', $activityIds) . ")
            GROUP BY a.id";

            $activityResult = CRM_Core_DAO::executeQuery($activityQuery);
            while ($activityResult->fetch())
            {
                $activityContact = array(
                    self::ACTIVITY_CONTACT_ASSIGNEE => array(),
                    self::ACTIVITY_CONTACT_CREATOR => array(),
                    self::ACTIVITY_CONTACT_TARGET => array(),
                );

                $activityContactRow = explode('|', $activityResult->activity_contact);
                foreach ($activityContactRow as $value)
                {
                    list($type, $cId, $cSortName) = explode(':', $value);

                    $contactUrl = CIVICRM_UF_BASEURL . '/civicrm/contact/view?reset=1&cid=' . $cId;
                    $activityContact[$type][$cId] = '<a href="' . $contactUrl . '" style="color:#42b0cb;font-weight:normal;text-decoration:underline;">' . $cSortName . '</a>';
                }

                $reminderKeys = array();
                if (array_key_exists($contactId, $activityContact[self::ACTIVITY_CONTACT_ASSIGNEE]))
                {
                    if ($activityResult->activity_date < $now)
                    {
                        $reminderKeys[] = 'overdue';
                    }
                    elseif ($activityResult->activity_date > $now)
                    {
                        $reminderKeys[] = 'coming_up';
                    }
                    else
                    {
                        $reminderKeys[] = 'today_mine';
                    }
                }
                if (array_key_exists($contactId, $activityContact[self::ACTIVITY_CONTACT_CREATOR]) && $activityResult->activity_date === $now)
                {
                    $reminderKeys[] = 'today_others';
                }

                // Fill the $reminderData array:
                foreach ($reminderKeys as $reminderKey)
                {
                    $reminderData[$reminderKey][] = array(
                        'id' => $activityResult->id,
                        'activityUrl' => CIVICRM_UF_BASEURL . '/civicrm/activity/view?action=view&reset=1&id=' . $activityResult->id . '&cid=&context=activity&searchContext=activity',
                        'typeId' => $activityResult->activity_type_id,
                        'type' => self::$_activityOptions['type'][$activityResult->activity_type_id],
                        'statusId' => $activityResult->status_id,
                        'status' => self::$_activityOptions['status'][$activityResult->status_id],
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
        if ($settings['keydates_tab']['value'])
        {
            $keyDates = CRM_Tasksassignments_KeyDates::get($now, $to);
            foreach ($keyDates as $keyDate)
            {
                $reminderData['upcoming_keydates'][] = array_merge(
                    $keyDate,
                    array(
                        'label' => $keyDateLabels[$keyDate['type']],
                    )
                );
                if ($keyDate['keydate'] == $now)
                {
                    $todayKeydatesCount++;
                }
            }
        }
        $reminderData['today_keydates_count'] = $todayKeydatesCount;

        if (self::$_relatedExtensions['appraisals'])
        {
            $appraisals = CRM_Appraisals_Reminder::get($now, $to, $contactId);
            foreach ($appraisals as $appraisal)
            {
                $reminderData['appraisals'][] = $appraisal;
            }
        }

        return $reminderData;
    }

    /**
     * @param int $contactId
     * @param string $email
     * @param string $template
     * @param string $html
     *
     * @return bool
     */
    private static function _send($contactId, $email, $body_subject, $body_html)
    {
        $domain     = CRM_Core_BAO_Domain::getDomain();
        $result     = false;
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

        if (!$contact || is_a($contact, 'CRM_Core_Error'))
        {
            return NULL;
        }

        // get tokens to be replaced
        $tokens = array_merge(CRM_Utils_Token::getTokens($body_text),
                              CRM_Utils_Token::getTokens($body_html),
                              CRM_Utils_Token::getTokens($body_subject));

        // get replacement text for these tokens
        $returnProperties = array("preferred_mail_format" => 1);
        if (isset($tokens['contact']))
        {
            foreach ($tokens['contact'] as $key => $value)
            {
                $returnProperties[$value] = 1;
            }
        }
        list($details) = CRM_Utils_Token::getTokenDetails(array($contactId),
                                                          $returnProperties,
                                                          null, null, false,
                                                          $tokens,
                                                          'CRM_Core_BAO_MessageTemplate');
        $contact = reset( $details );

        // call token hook
        $hookTokens = array();
        CRM_Utils_Hook::tokens($hookTokens);
        $categories = array_keys($hookTokens);

        // do replacements in text and html body
        $type = array('html', 'text');
        foreach ($type as $key => $value)
        {
            $bodyType = "body_{$value}";
            if ($$bodyType)
            {
                CRM_Utils_Token::replaceGreetingTokens($$bodyType, NULL, $contact['contact_id']);
                $$bodyType = CRM_Utils_Token::replaceDomainTokens($$bodyType, $domain, true, $tokens, true);
                $$bodyType = CRM_Utils_Token::replaceContactTokens($$bodyType, $contact, false, $tokens, false, true);
                $$bodyType = CRM_Utils_Token::replaceComponentTokens($$bodyType, $contact, $tokens, true);
                $$bodyType = CRM_Utils_Token::replaceHookTokens($$bodyType, $contact , $categories, true);
            }
        }
        $html = $body_html;
        $text = $body_text;

        $smarty = CRM_Core_Smarty::singleton();
        foreach (array('text', 'html') as $elem)
        {
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
        )
        {
            // render the &amp; entities in text mode, so that the links work
            $mailParams['text'] = str_replace('&amp;', '&', $text);
        }
        if ($html && ($contact['preferred_mail_format'] == 'HTML' ||
            $contact['preferred_mail_format'] == 'Both'
          ))
        {
            $mailParams['html'] = $html;
        }

        $result = CRM_Utils_Mail::send($mailParams);

        return $result;
    }
}
