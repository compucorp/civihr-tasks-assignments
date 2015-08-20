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
    return NULL;
  }

  // add shortcut to Create New
  /**
   * @param $shortCuts
   * @param $newCredit
   */
  public function creatNewShortcut(&$shortCuts, $newCredit) {
  }
  
  /**
   * Provides the xml menu files
   *
   * @return array array of menu files
   * @access public
   *
   */
  public function menuFiles() {
      return array();
  }
}

