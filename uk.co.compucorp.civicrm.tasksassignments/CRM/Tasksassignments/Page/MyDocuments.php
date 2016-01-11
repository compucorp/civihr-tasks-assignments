<?php

class CRM_Tasksassignments_Page_MyDocuments extends CRM_Core_Page {
  function run()
  {
    if (!CRM_Core_Permission::check('access Tasks and Assignments')) {
      CRM_Utils_System::redirect('/dashboard#documents');
    }
    else {
      CRM_Utils_System::redirect('/civicrm/tasksassignments/dashboard#/documents');
    }

    return FALSE;
  }
}