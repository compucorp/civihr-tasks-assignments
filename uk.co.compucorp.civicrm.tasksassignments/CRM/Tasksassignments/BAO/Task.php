<?php

class CRM_Tasksassignments_BAO_Task extends CRM_Tasksassignments_DAO_Task {
  /**
   * Create a new Task based on array-data
   *
   * @param array $params key-value pairs
   * @return CRM_Tasksassignments_DAO_Task|NULL
   */
  public static function create(&$params) {
    $entityName = 'Task';
    $hook = empty($params['id']) ? 'create' : 'edit';

    if ($hook === 'create') {
        // If creating a new Task, we require these to be defined.
        if (empty($params['source_contact_id']) || empty($params['target_contact_id'])) {
          throw new CRM_Exception("Please specify 'source_contact_id' and 'target_contact_id'.");
        }
        if (empty($params['status_id'])) {
          $params['status_id'] = 1;
        }
    }

    $id = CRM_Utils_Array::value('id', $params);
    CRM_Utils_Hook::pre($hook, $entityName, $id, $params);

    $currentInstance = new static();
    $currentInstance->get('id', $id);

    $previousAssigneeId = self::getPreviousAssigneeId($id);

    $instance = parent::create($params);
    CRM_Tasksassignments_Reminder::sendReminder((int) $instance->id, NULL, FALSE, $previousAssigneeId);

    CRM_Utils_Hook::post($hook, $entityName, $instance->id, $instance);

    return $instance;
  }

  /**
   * Gets the first previous assignee (if she exists) of the task with the given id
   *
   * @param {int} $taskId
   * @return {int/null}
   */
  private static function getPreviousAssigneeId($taskId) {
    $id = null;

    if (!$taskId) {
      return $id;
    }

    $activityContactResult = civicrm_api3('ActivityContact', 'get', [
      'sequential' => 1,
      'activity_id' => $taskId,
    ]);

    foreach ($activityContactResult['values'] as $value) {
      if ($value['record_type_id'] == 1) { // 1 is assignee
        $id = $value['contact_id'];
        break;
      }
    }

    return $id;
  }

  /**
   * Check if user has sufficient permission for view/edit Activity record.
   *
   * @param int $activityId
   * @param int $action
   *
   * @return bool
   */
  public static function checkPermission($activityId, $action) {
    $allow = FALSE;
    if (!$activityId || !in_array($action, [CRM_Core_Action::UPDATE, CRM_Core_Action::VIEW])) {
      return FALSE;
    }

    $activity = new CRM_Activity_DAO_Activity();
    $activity->id = $activityId;

    if (!$activity->find(TRUE)) {
      return FALSE;
    }

    $componentId = self::getComponentIdByActivityTypeId($activity->activity_type_id);
    $allow = self::checkComponentRelatedPermissions($componentId);
    $allow = self::checkContactsPermissions($componentId, $activity->id, $action, $allow);

    return $allow;
  }

  /**
   * Check Contacts related permissions for specified values and initial
   * $allow state.
   *
   * @param int $componentId
   * @param int $activityId
   * @param int $action
   * @param boolean $allow
   *
   * @return boolean
   */
  private static function checkContactsPermissions($componentId, $activityId, $action, $allow) {
    $permission = self::getPermissionByAction($action);
    $activityContacts = CRM_Core_OptionGroup::values('activity_contacts', FALSE, FALSE, FALSE, NULL, 'name');
    $sourceID = CRM_Utils_Array::key('Activity Source', $activityContacts);
    $targetID = CRM_Utils_Array::key('Activity Targets', $activityContacts);
    $assigneeID = CRM_Utils_Array::key('Activity Assignees', $activityContacts);

    // Check for source contact.
    if (!$componentId || $allow) {
      $sourceContactId = self::getActivityContact($activityId, $sourceID);
      // Account for possibility of activity not having a source contact (as it may have been deleted).
      $allow = $sourceContactId ? CRM_Contact_BAO_Contact_Permission::allow($sourceContactId, $permission) : TRUE;
    }

    // Check for target and assignee contacts.
    if ($allow) {
      // Check for super permissions.
      $allow = self::checkSuperPermissionsByAction($action);

      // User might have sufficient permission, through acls.
      if (!$allow) {
        // Check permission for Target contact.
        $allow = self::checkActivityContactsPermission($activityId, $targetID, $permission);

        if ($allow) {
          // Check permission for Assignee contact.
          $allow = self::checkActivityContactsPermission($activityId, $assigneeID, $permission);
        }
      }
    }

    return $allow;
  }

  /**
   * Return required permission by specified action.
   *
   * @param int $action
   *
   * @return int
   */
  private static function getPermissionByAction($action) {
    return $action === CRM_Core_Action::UPDATE ? CRM_Core_Permission::EDIT : CRM_Core_Permission::VIEW;
  }

  /**
   * Return Component ID for given Activity Type ID or NULL if the Component
   * does not exist.
   *
   * @param int $activityTypeId
   *
   * @return int|NULL
   */
  private static function getComponentIdByActivityTypeId($activityTypeId) {
    $optionValue = civicrm_api3('OptionValue', 'get', [
      'sequential' => 1,
      'return' => ['component_id'],
      'option_group_id' => 'activity_type',
      'value' => $activityTypeId,
    ]);

    return !empty($optionValue['values'][0]['component_id']) ? $optionValue['values'][0]['component_id'] : NULL;
  }

  /**
   * Check Tasks and Documents permissions for given Component ID.
   *
   * @param int $componentId
   *
   * @return boolean
   */
  private static function checkComponentRelatedPermissions($componentId) {
    $compPermissions = [
      'CiviTask' => ['access Tasks and Assignments'],
      'CiviDocument' => ['access Tasks and Assignments'],
    ];

    if (!empty($componentId)) {
      $componentName = CRM_Core_Component::getComponentName($componentId);
      $compPermission = CRM_Utils_Array::value($componentName, $compPermissions);

      // Here we are interesting in any single permission.
      if (is_array($compPermission)) {
        foreach ($compPermission as $per) {
          if (CRM_Core_Permission::check($per)) {
            return TRUE;
          }
        }
      }
    }

    return FALSE;
  }

  /**
   * Check super permissions for given action.
   *
   * @param string $action
   *
   * @return boolean
   */
  private static function checkSuperPermissionsByAction($action) {
    $supPermission = 'view all contacts';

    if ($action == CRM_Core_Action::UPDATE) {
      $supPermission = 'edit all contacts';
    }

    return CRM_Core_Permission::check($supPermission);
  }

  /**
   * Check Contacts permission for given Activity ID.
   *
   * @param int $activityId
   * @param int $contactKey
   * @param int $permission
   *
   * @return boolean
   */
  private static function checkActivityContactsPermission($activityId, $contactKey, $permission) {
    $contacts = CRM_Activity_BAO_ActivityContact::retrieveContactIdsByActivityId($activityId, $contactKey);

    foreach ($contacts as $cnt => $contactId) {
      if (!CRM_Contact_BAO_Contact_Permission::allow($contactId, $permission)) {
        return FALSE;
      }
    }

    return TRUE;
  }
}
