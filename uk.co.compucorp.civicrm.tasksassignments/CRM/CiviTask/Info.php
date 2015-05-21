<?php

require_once 'CRM/Core/Component/Info.php';

/**
 * This class introduces component to the system and provides all the
 * information about it. It needs to extend CRM_Core_Component_Info
 * abstract class.
 *
 */

class CRM_CiviTask_Info extends CRM_Core_Component_Info {

  // docs inherited from interface
  protected $keyword = 'task';

  // docs inherited from interface
  /**
   * @return array
   */
  public function getInfo() {
    return array(
      'name' => 'CiviTask',
      'translatedName' => ts('CiviTask'),
      'title' => ts('CiviCRM Task Engine'),
      'search' => 1,
      'showActivitiesInCore' => 1,
    );
  }

  // docs inherited from interface
  /**
   * @param bool $getAllUnconditionally
   *
   * @return array
   */
  public function getPermissions($getAllUnconditionally = FALSE) {
    /*return array(
      'access CiviEvent',
      'edit event participants',
      'edit all events',
      'register for events',
      'view event info',
      'view event participants',
      'delete in CiviEvent',
    );*/
    return array();
  }

  /**
   * @return array
   */
  public function getAnonymousPermissionWarnings() {
    return array(
      'access CiviTask',
    );
  }

  // docs inherited from interface
  /**
   * @return array
   */
  public function getUserDashboardElement() {
    /*return array('name' => ts('Tasks'),
      'title' => ts('Your Task(s)'),
      'perm' => array('register for events'),
      'weight' => 20,
    );*/
    return array();
  }

  // docs inherited from interface
  /**
   * @return array
   */
  public function registerTab() {
    return array('title' => ts('Tasks'),
      'id' => 'task',
      'url' => 'task',
      'weight' => 99,
    );
  }

  // docs inherited from interface
  /**
   * @return array
   */
  public function registerAdvancedSearchPane() {
    return array('title' => ts('Tasks'),
      'weight' => 99,
    );
  }

  // docs inherited from interface
  /**
   * @return array
   */
  public function getActivityTypes() {
    /*$types = array();
    $types['Event'] = array('title' => ts('Event'),
      'callback' => 'CRM_Event_Page_EventInfo::run()',
    );
    return $types;*/
    return NULL;
  }

  // add shortcut to Create New
  /**
   * @param $shortCuts
   * @param $newCredit
   */
  public function creatNewShortcut(&$shortCuts, $newCredit) {
    /*if (CRM_Core_Permission::check('access CiviEvent') &&
      CRM_Core_Permission::check('edit event participants')
    ) {
      $shortCut[] = array(
        'path' => 'civicrm/participant/add',
        'query' => "reset=1&action=add&context=standalone",
        'ref' => 'new-participant',
        'title' => ts('Event Registration'),
      );
      if ($newCredit) {
        $title = ts('Event Registration') . '<br />&nbsp;&nbsp;(' . ts('credit card') . ')';
        $shortCut[0]['shortCuts'][] = array(
          'path' => 'civicrm/participant/add',
          'query' => "reset=1&action=add&context=standalone&mode=live",
          'ref' => 'new-participant-cc',
          'title' => $title,
        );
      }
      $shortCuts = array_merge($shortCuts, $shortCut);
    }*/
  }
}

