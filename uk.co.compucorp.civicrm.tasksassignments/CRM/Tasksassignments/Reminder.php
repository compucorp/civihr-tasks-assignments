<?php

class CRM_Tasksassignments_Reminder
{
    const ACTIVITY_CONTACT_ASSIGNEE = 1;
    const ACTIVITY_CONTACT_CREATOR = 2;
    const ACTIVITY_CONTACT_TARGET = 3;
    
    private static $_activityOptions = array();
    
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
        }
    }
    
    public static function sendReminder($activityId, $notes = null)
    {
        self::_setActivityOptions();
        
        $activityContact = array(
            1 => array(), // assignees
            2 => array(), // source
            3 => array(), // targets
        );
        
        $emailToContactId = array();
        
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
            $activityContact[$value['record_type_id']]['ids'][] = $value['contact_id'];
        }
        
        foreach ($activityContact as $key => $value)
        {
            if (empty($value))
            {
                continue;
            }
            
            $links = array();
            $names = array();
            $emails = array();
            
            $contactResult = civicrm_api3('Contact', 'get', array(
              'return' => 'sort_name',
              'id' => array('IN' => $value['ids']),
            ));
            
            $emailResult = civicrm_api3('Email', 'get', array(
              'return' => 'contact_id,email',
              'contact_id' => array('IN' => $value['ids']),
              'is_primary' => 1,
            ));
            
            foreach ($contactResult['values'] as $contactKey => $contactValue)
            {
                $url = CIVICRM_UF_BASEURL . '/civicrm/contact/view?reset=1&cid=' . $contactKey;
                $links[] = '<a href="' . $url . '" style="color:#42b0cb;font-weight:normal;text-decoration:underline;">' . $contactValue['sort_name'] . '</a>';
                $names[] = $contactValue['sort_name'];
            }
            
            foreach ($emailResult['values'] as $contactValue)
            {
                $emails[] = $contactValue['email'];
                $emailToContactId[$contactValue['email']] = $contactValue['contact_id'];
            }
            
            $activityContact[$key]['links'] = $links;
            $activityContact[$key]['names'] = $names;
            $activityContact[$key]['emails'] = $emails;
        }
        
        $template = &CRM_Core_Smarty::singleton();
        
        $recipients = array_unique(array_merge($activityContact[1]['emails'], $activityContact[2]['emails']));
        foreach ($recipients as $recipient)
        {
            $contactId = $emailToContactId[$recipient];
            $activityName = implode(', ', $activityContact[3]['names']) . ' - ' . self::$_activityOptions['type'][$activityResult['activity_type_id']];
            $templateBodyHTML = $template->fetchWith('CRM/Tasksassignments/Reminder/Reminder.tpl', array(
                'notes' => $notes,
                'activityUrl' => CIVICRM_UF_BASEURL . '/civicrm/activity/view?action=view&reset=1&id=' . $activityId . '&cid=&context=activity&searchContext=activity',
                'activityName' => $activityName,
                'activityType' => self::$_activityOptions['type'][$activityResult['activity_type_id']],
                'activityTargets' => implode(', ', $activityContact[3]['links']),
                'activityAssignee' => implode(', ', $activityContact[1]['links']),
                'activityStatus' => self::$_activityOptions['status'][$activityResult['status_id']],
                'activityDue' => substr($activityResult['activity_date_time'], 0, 10),
                'activitySubject' => $activityResult['subject'],
                'activityDetails' => $activityResult['details'],
                'baseUrl' => CIVICRM_UF_BASEURL,
                'myTasksUrl' => CIVICRM_UF_BASEURL . '/civicrm/tasksassignments/dashboard#/tasks/my',
                'myDocumentsUrl' => CIVICRM_UF_BASEURL . '/civicrm/tasksassignments/dashboard#/documents/my',
            ));
            
            self::_send($contactId, $recipient, $activityName, $templateBodyHTML);
        }

        return true;
    }
    
    public static function sendDailyReminder()
    {
        self::_setActivityOptions();
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
        
        $contactsQuery = "SELECT GROUP_CONCAT(a.id) AS activity_ids, ac.contact_id, e.email
            FROM `civicrm_activity` a
            LEFT JOIN civicrm_activity_contact ac ON ac.activity_id = a.id
            LEFT JOIN civicrm_email e ON e.contact_id = ac.contact_id
            WHERE activity_date_time <='2015-07-07'
            AND a.status_id IN (" . implode(',', $incompleteStatuses) . ")
            AND ac.record_type_id IN (1,2)
            AND e.is_primary = 1
            AND a.activity_type_id IN (
                SELECT value FROM civicrm_option_value ov
                LEFT JOIN civicrm_option_group og ON ov.option_group_id = og.id
                LEFT JOIN civicrm_component co ON ov.component_id = co.id
                WHERE og.name = 'activity_type'
                AND co.name IN (" . implode(',', $components) . ")
            )
            GROUP BY ac.contact_id";
        $contactsParams = array(
            1 => array($to, 'String'),
        );
        
        $contactsResult = CRM_Core_DAO::executeQuery($contactsQuery, $contactsParams);
        while ($contactsResult->fetch())
        {
            $reminderData = self::_getContactDailyReminderData($contactsResult->contact_id, explode(',', $contactsResult->activity_ids), $to, $settings);
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
        $reminderData = array(
            'overdue' => array(),
            'today_mine' => array(),
            'today_others' => array(),
            'coming_up' => array(),
            'upcoming_keydates' => array(),
        );
        $keyDateLabels = array(
            'period_start_date' => 'Perion start date',
            'period_end_date' => 'Period end date',
            'initial_join_date' => 'Initial join date',
            'final_termination_date' => 'Final termination date',
            'birth_date' => 'Birthday',
        );
        $now = date('Y-m-d');
        
        $activityQuery = "SELECT a.id, a.activity_type_id, a.status_id, DATE(a.activity_date_time) AS activity_date,
        GROUP_CONCAT(ac.record_type_id,  ':', ac.contact_id,  ':', contact.sort_name SEPARATOR  '|') AS activity_contact,
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
        
        $todayKeydatesCount = 0;
        if ($settings['keydates_tab']['value'])
        {
            $today = date('Y-m-d');
            $keyDates = CRM_Tasksassignments_KeyDates::get($today, $to, $contactId);
            foreach ($keyDates as $keyDate)
            {
                $reminderData['upcoming_keydates'][] = array_merge(
                    $keyDate,
                    array(
                        'label' => $keyDateLabels[$keyDate['type']],
                    )
                );
                if ($keyDate['keydate'] == $today)
                {
                    $todayKeydatesCount++;
                }
            }
        }
        $reminderData['today_keydates_count'] = $todayKeydatesCount;
        
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
          //'from' => $from, // TODO
          'toName' => $contact['display_name'],
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
