<?php

class CRM_Tasksassignments_BAO_Document extends CRM_Tasksassignments_DAO_Document
{
    /**
     * Create a new Document based on array-data
     *
     * @param array $params key-value pairs
     * @return CRM_Tasksassignments_DAO_Document|NULL
     */
    public static function create(&$params)
    {
        $entityName = 'Document';
        $hook = empty($params['id']) ? 'create' : 'edit';
        CRM_Utils_Hook::pre($hook, $entityName, CRM_Utils_Array::value('id', $params), $params);
        
        if (empty($params['status_id']) && $hook === 'create')
        {
            $params['status_id'] = 1;
        }
        
        $instance = parent::create($params);
        CRM_Tasksassignments_Reminder::sendReminder((int)$instance->id);
        
        CRM_Utils_Hook::post($hook, $entityName, $instance->id, $instance);
        
        return $instance;
    }
}
