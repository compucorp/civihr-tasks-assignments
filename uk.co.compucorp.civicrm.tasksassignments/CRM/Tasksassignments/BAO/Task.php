<?php

class CRM_Tasksassignments_BAO_Task extends CRM_Tasksassignments_DAO_Task
{
  /**
   * Create a new Task based on array-data
   *
   * @param array $params key-value pairs
   * @return CRM_Tasksassignments_DAO_Task|NULL
   *
  public static function create($params) {
    $className = 'CRM_Tasksassignments_DAO_Task';
    $entityName = 'Task';
    $hook = empty($params['id']) ? 'create' : 'edit';

    CRM_Utils_Hook::pre($hook, $entityName, CRM_Utils_Array::value('id', $params), $params);
    $instance = new $className();
    $instance->copyValues($params);
    $instance->save();
    CRM_Utils_Hook::post($hook, $entityName, $instance->id, $instance);

    return $instance;
  } */
}
