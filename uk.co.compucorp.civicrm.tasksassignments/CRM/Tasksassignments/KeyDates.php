<?php

class CRM_Tasksassignments_KeyDates
{
    public static function getContactIds($startDate = null, $endDate = null)
    {
        $tableExists = self::_checkTableExists(array(
            'civicrm_value_jobcontract_dates_13',
            'civicrm_contact',
            'civicrm_value_job_summary_10',
            'civicrm_value_probation_12',
        ));
        $result = array();
        
        if (!$startDate)
        {
            $startDate = date('Y-m-d');
        }
        if (!$endDate)
        {
            $endDate = date('Y') . '-12-31';
        }
        
        $query = self::_buildQuery($tableExists, $startDate, $endDate);
        $keyDates = CRM_Core_DAO::executeQuery($query);
        while ($keyDates->fetch())
        {
            $result[] = $keyDates->contact_id;
        }
        
        return $result;
    }
    
    public static function get($startDate = null, $endDate = null, $contactId = null)
    {
        $tableExists = self::_checkTableExists(array(
            'civicrm_value_jobcontract_dates_13',
            'civicrm_contact',
            'civicrm_value_job_summary_10',
            'civicrm_value_probation_12',
        ));
        $result = array();
        
        if (!$startDate)
        {
            $startDate = date('Y-m-d');
        }
        if (!$endDate)
        {
            $endDate = date('Y') . '-12-31';
        }
        
        $query = self::_buildQuery($tableExists, $startDate, $endDate, $contactId);
        
        if (!$query)
        {
            return $result;
        }
        
        if ($startDate)
        {
            list($sy, $sm, $sd) = explode('-', $startDate);
        }
        
        $keyDates = CRM_Core_DAO::executeQuery($query);
        while ($keyDates->fetch())
        {
            $keydate = $keyDates->keydate;
            if ($keyDates->type === 'birth_date' && $startDate)
            {
                list(, $km, $kd) = explode('-', $keydate);
                if ($km . '-' . $kd >= $sm . '-' . $sd)
                {
                    $keydate = $sy . '-' . $km . '-' . $kd;
                }
                else
                {
                    $keydate = $sy + 1 . '-' . $km . '-' . $kd;
                }
            }
            
            $row = $keyDates->toArray();
            $row['keydate'] = $keydate;
            $result[] = $row;
        }
        
        return $result;
    }
    
    public static function exportCsv()
    {
        $config = CRM_Core_Config::singleton();
        $startDate = isset($_REQUEST['start_date']) ? $_REQUEST['start_date'] : null;
        $endDate = isset($_REQUEST['end_date']) ? $_REQUEST['end_date'] : null;
        $fields = array(
            'Contact ID',
            'Contact External Identifier',
            'Contact Sort Name',
            'Contact Url',
            'Keydate',
            'Type',
        );
        $out = fopen("php://output", 'w');
        
        $keyDates = self::get($startDate, $endDate);
        
        fputcsv($out, $fields, $config->fieldSeparator, '"');
        
        header('Content-Type: text/csv');
        $datetime = date('Ymd-Gi', $_SERVER['REQUEST_TIME']);
        header('Content-Disposition: attachment; filename=KeyDates_' . $datetime . '.csv');
        
        foreach ($keyDates as $keyDate)
        {
            $row = array(
                $keyDate['contact_id'],
                $keyDate['contact_external_identifier'],
                $keyDate['contact_name'],
                '/civicrm/contact/view?reset=1&cid=' . $keyDate['contact_id'],
                $keyDate['keydate'],
                $keyDate['type'],
            );
            fputcsv($out, $row, $config->fieldSeparator, '"');
        }
        
        fclose($out);
        
        CRM_Utils_System::civiExit();
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
    
    private static function _buildQuery(array $tableExists, $startDate, $endDate, $contactId = null)
    {
        $queries = array();
        
        if ($tableExists['civicrm_value_jobcontract_dates_13'])
        {
            $queries[] = "SELECT jcd.entity_id AS contact_id, external_identifier AS contact_external_identifier, c.sort_name AS contact_name, DATE(contract_start_date) AS keydate, 'period_start_date' AS type FROM civicrm_value_jobcontract_dates_13 jcd 
                LEFT JOIN civicrm_contact c ON jcd.entity_id = c.id 
                WHERE contract_start_date IS NOT NULL 
            " . self::_buildWhereDateRange('contract_start_date', $startDate, $endDate)
              . self::_buildWhereContactId('entity_id', $contactId);
            $queries[] = "SELECT jcd.entity_id AS contact_id, external_identifier AS contact_external_identifier, c.sort_name AS contact_name, DATE(contract_end_date) AS keydate, 'period_end_date' AS type FROM civicrm_value_jobcontract_dates_13 jcd 
                LEFT JOIN civicrm_contact c ON jcd.entity_id = c.id 
                WHERE contract_end_date IS NOT NULL 
            " . self::_buildWhereDateRange('contract_end_date', $startDate, $endDate)
              . self::_buildWhereContactId('entity_id', $contactId);
        }
        if ($tableExists['civicrm_contact'])
        {
            $whereDate = array();
            $sy = 0;
            $ey = 0;
            if ($startDate)
            {
                list($sy, $sm, $sd) = explode('-', $startDate);
                $whereDate[] = " DATE_FORMAT(`birth_date` , '%m-%d') >=  '{$sm}-{$sd}' ";
            }
            if ($endDate)
            {
                list($ey, $em, $ed) = explode('-', $endDate);
                $whereDate[] = " DATE_FORMAT(`birth_date` , '%m-%d') <=  '{$em}-{$ed}' ";
            }
            
            $con = ' AND ';
            if ($ey > $sy)
            {
                $con = ' OR ';
            }
            
            $query = "
                SELECT id as contact_id, external_identifier as contact_external_identifier, sort_name as contact_name,  
                    IF( DATE_FORMAT(  `birth_date` ,  '%m-%d' ) <  '{$sm}-{$sd}',
                      CONCAT( {$sy} +1,  '-', DATE_FORMAT(  `birth_date` ,  '%m-%d' ) ) ,
                      CONCAT( {$sy} ,  '-', DATE_FORMAT(  `birth_date` ,  '%m-%d' ) )
                    ) AS keydate, 'birth_date' as type FROM civicrm_contact
                WHERE birth_date IS NOT NULL
            " . self::_buildWhereContactId('id', $contactId);
            
            if (!empty($whereDate))
            {
                $query .= ' AND (' . implode($con, $whereDate) . ')';
            }
            
            $queries[] = $query;
        }
        if ($tableExists['civicrm_value_job_summary_10'])
        {
            $queries[] = "
                SELECT entity_id as contact_id, external_identifier as contact_external_identifier, c.sort_name as contact_name, DATE(initial_join_date_56) as keydate, 'initial_join_date' as type FROM civicrm_value_job_summary_10 vjs
                LEFT JOIN civicrm_contact c ON vjs.entity_id = c.id
                WHERE initial_join_date_56 IS NOT NULL
            " . self::_buildWhereDateRange('initial_join_date_56', $startDate, $endDate)
              . self::_buildWhereContactId('entity_id', $contactId);
            $queries[] = "
                SELECT entity_id as contact_id, external_identifier as contact_external_identifier, c.sort_name as contact_name, DATE(final_termination_date_57) as keydate, 'final_termination_date' as type FROM civicrm_value_job_summary_10 vjs
                LEFT JOIN civicrm_contact c ON vjs.entity_id = c.id
                WHERE final_termination_date_57 IS NOT NULL
            " . self::_buildWhereDateRange('final_termination_date_57', $startDate, $endDate)
              . self::_buildWhereContactId('entity_id', $contactId);
        }
        if ($tableExists['civicrm_value_probation_12'])
        {
            $queries[] = "
                SELECT entity_id as contact_id, external_identifier as contact_external_identifier, c.sort_name as contact_name, DATE(probation_end_date) as keydate, 'probation_end_date' as type FROM civicrm_value_probation_12 vp
                LEFT JOIN civicrm_contact c ON vp.entity_id = c.id
                WHERE probation_end_date IS NOT NULL
            " . self::_buildWhereDateRange('probation_end_date', $startDate, $endDate)
              . self::_buildWhereContactId('entity_id', $contactId);
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
    
    private static function _buildWhereContactId($field, $contactId)
    {
        if (!$contactId)
        {
            return '';
        }
        
        return ' AND ' . $field . ' = ' . $contactId . ' ';
    }
}
