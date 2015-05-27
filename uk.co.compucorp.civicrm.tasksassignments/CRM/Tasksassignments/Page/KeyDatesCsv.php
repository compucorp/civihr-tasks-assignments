<?php

require_once 'CRM/Core/Page.php';

class CRM_Tasksassignments_Page_KeyDatesCsv extends CRM_Core_Page {
    function run() {
        CRM_Tasksassignments_KeyDates::exportCsv();
    }
}
