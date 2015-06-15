<?php

class CRM_Tasksassignments_Page_Dashboard extends CRM_Tasksassignments_Page_Tasksassignments {
    function run() {
        self::registerScripts();
        parent::run();
    }
}
