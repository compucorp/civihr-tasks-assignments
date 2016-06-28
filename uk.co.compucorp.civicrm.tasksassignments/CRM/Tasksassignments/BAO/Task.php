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
        // If creating a new Task, we require all three contacts to be defined.
        if (empty($params['source_contact_id'] || empty($params['target_contact_id']) || empty($params['assignee_contact_id']))) {
            throw new CiviCRM_API3_Exception("Please specify 'source_contact_id', 'target_contact_id' and 'assignee_contact_id'.");
        }
    }

    CRM_Utils_Hook::pre($hook, $entityName, CRM_Utils_Array::value('id', $params), $params);

    if (empty($params['status_id']) && $hook === 'create') {
      $params['status_id'] = 1;
    }

    $currentInstance = new static();
    $currentInstance->get('id', $params['id']);

    $previousAssigneeId = self::getPreviousAssigneeId($params['id']);

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

    $activityContactResult = civicrm_api3('ActivityContact', 'get', array(
      'sequential' => 1,
      'activity_id' => $taskId,
    ));

    foreach ($activityContactResult['values'] as $value) {
      if ($value['record_type_id'] == 1) { // 1 is assignee
        $id = $value['contact_id'];
        break;
      }
    }

    return $id;
  }
}
