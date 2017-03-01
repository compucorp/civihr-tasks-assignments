<?php
/*
 +--------------------------------------------------------------------+
 | CiviCRM version 4.5                                                |
 +--------------------------------------------------------------------+
 | Copyright CiviCRM LLC (c) 2004-2014                                |
 +--------------------------------------------------------------------+
 | This file is a part of CiviCRM.                                    |
 |                                                                    |
 | CiviCRM is free software; you can copy, modify, and distribute it  |
 | under the terms of the GNU Affero General Public License           |
 | Version 3, 19 November 2007 and the CiviCRM Licensing Exception.   |
 |                                                                    |
 | CiviCRM is distributed in the hope that it will be useful, but     |
 | WITHOUT ANY WARRANTY; without even the implied warranty of         |
 | MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.               |
 | See the GNU Affero General Public License for more details.        |
 |                                                                    |
 | You should have received a copy of the GNU Affero General Public   |
 | License and the CiviCRM Licensing Exception along                  |
 | with this program; if not, contact CiviCRM LLC                     |
 | at info[AT]civicrm[DOT]org. If you have questions about the        |
 | GNU Affero General Public License or the licensing of CiviCRM,     |
 | see the CiviCRM license FAQ at http://civicrm.org/licensing        |
 +--------------------------------------------------------------------+
*/

/**
 *
 * @package CRM
 * @copyright CiviCRM LLC (c) 2004-2014
 *
 */

/**
 * This class contains all case related functions that are called using AJAX (jQuery)
 */
class CRM_Tasksassignments_Page_AJAX {

  /**
   * Retrieve cases for auto-complete input.
   */
  public static function autocompleteCases() {
    $params = array(
      'limit' => CRM_Core_BAO_Setting::getItem(CRM_Core_BAO_Setting::SYSTEM_PREFERENCES_NAME, 'search_autocomplete_count', NULL, 10),
      'sort_name' => CRM_Utils_Type::escape(CRM_Utils_Array::value('sortName', $_GET, ''), 'String'),
    );

    $excludeCaseIds = array();
    if (!empty($_GET['excludeCaseIds'])) {
      $excludeCaseIds = explode(',', CRM_Utils_Type::escape($_GET['excludeCaseIds'], 'String'));
    }
    $unclosedCases = CRM_Tasksassignments_BAO_Assignment::retrieveCases($params, $excludeCaseIds);
    $results = array();
    foreach ($unclosedCases as $caseId => $details) {
      $results[] = array(
        'id' => $caseId,
        'label' => $details['sort_name'] . ' - ' . $details['case_type'] . ($details['end_date'] ? ' (' . ts('closed') . ')' : ''),
        'label_class' => $details['end_date'] ? 'strikethrough' : '',
        'description' => array($details['case_subject'] . ' (' . $details['case_status'] . ')'),
        'extra' => $details,
      );
    }
    CRM_Utils_JSON::output($results);
  }

}

