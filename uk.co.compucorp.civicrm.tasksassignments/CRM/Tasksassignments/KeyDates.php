<?php

class CRM_Tasksassignments_KeyDates
{
    public static function get($startDate = null, $endDate = null)
    {
        $tableExists = self::_checkTableExists(array(
            'civicrm_hrjobcontract_details',
            'civicrm_contact',
            'civicrm_value_job_summary_10',
        ));
        $result = array();
        
        $query = self::_buildQuery($tableExists, $startDate, $endDate);
        
        if (!$query)
        {
            return $result;
        }
        
        $keyDates = CRM_Core_DAO::executeQuery($query);
        while ($keyDates->fetch())
        {
            $result[] = array(
                'contact_id' => $keyDates->contact_id,
                'contact_name' => $keyDates->contact_name,
                'contact_url' => CRM_Report_Utils_Report::getNextUrl('contact/detail', 'reset=1&force=&id_op=eq&id_value=' . $keyDates->contact_id),
                'keydate' => $keyDates->keydate,
                'type' => $keyDates->type,
            );
        }
        
        return $result;
    }
    
    private static function _checkTableExists(array $tables)
    {
        $result = array();

        foreach ($tables as $table)
        {
            $result[$table] = CRM_Core_DAO::checkTableExists($table);
        }

        return $result;
    }
    
    private static function _buildQuery(array $tableExists, $startDate, $endDate)
    {
        $queries = array();
        
        if ($tableExists['civicrm_hrjobcontract_details'])
        {
            $queries[] = "
                SELECT hrjc.contact_id as contact_id, c.sort_name as contact_name, period_start_date as keydate, 'period_start_date' as type FROM civicrm_hrjobcontract_details hrjc_d
                LEFT JOIN civicrm_hrjobcontract_revision hrjc_r ON hrjc_d.jobcontract_revision_id = hrjc_r.details_revision_id
                LEFT JOIN civicrm_hrjobcontract hrjc ON hrjc_r.jobcontract_id = hrjc.id
                LEFT JOIN civicrm_contact c ON hrjc.contact_id = c.id
                WHERE period_start_date IS NOT NULL
            " . self::_buildWhereDateRange('period_start_date', $startDate, $endDate);
            $queries[] = "
                SELECT hrjc.contact_id as contact_id, c.sort_name as contact_name, period_end_date as keydate, 'period_end_date' as type FROM civicrm_hrjobcontract_details hrjc_d
                LEFT JOIN civicrm_hrjobcontract_revision hrjc_r ON hrjc_d.jobcontract_revision_id = hrjc_r.details_revision_id
                LEFT JOIN civicrm_hrjobcontract hrjc ON hrjc_r.jobcontract_id = hrjc.id
                LEFT JOIN civicrm_contact c ON hrjc.contact_id = c.id
                WHERE period_end_date IS NOT NULL
            " . self::_buildWhereDateRange('period_end_date', $startDate, $endDate);
        }
        if ($tableExists['civicrm_contact'])
        {
            $queries[] = "
                SELECT id as contact_id, sort_name as contact_name, birth_date as keydate, 'birth_date' as type FROM civicrm_contact
                WHERE birth_date IS NOT NULL
            " . self::_buildWhereDateRange('birth_date', $startDate, $endDate); 
        }
        if ($tableExists['civicrm_value_job_summary_10'])
        {
            $queries[] = "
                SELECT entity_id as contact_id, c.sort_name as contact_name, initial_join_date_56 as keydate, 'initial_join_date' as type FROM civicrm_value_job_summary_10 vjs
                LEFT JOIN civicrm_contact c ON vjs.entity_id = c.id
                WHERE initial_join_date_56 IS NOT NULL
            " . self::_buildWhereDateRange('initial_join_date_56', $startDate, $endDate);
            $queries[] = "
                SELECT entity_id as contact_id, c.sort_name as contact_name, final_termination_date_57 as keydate, 'final_termination_date' as type FROM civicrm_value_job_summary_10 vjs
                LEFT JOIN civicrm_contact c ON vjs.entity_id = c.id
                WHERE final_termination_date_57 IS NOT NULL
            " . self::_buildWhereDateRange('final_termination_date_57', $startDate, $endDate);
        }
        
        return implode(' UNION ', $queries) . ' ORDER BY keydate ASC ';
    }
    
    private static function _buildWhereDateRange($field, $startDate = null, $endDate = null)
    {
        $conditions = array();
        
        if ($startDate)
        {
            $conditions[] = " {$field} >= CAST('{$startDate}' AS DATE) ";
        }
        if ($endDate)
        {
            $conditions[] = " {$field} <= CAST('{$endDate}' AS DATE) ";
        }
        
        if (!empty($conditions))
        {
            return ' AND (' . implode(' AND ', $conditions) . ') ';
        }
        
        return null;
    }
}
