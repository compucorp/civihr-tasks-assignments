<?php

class CRM_Tasksassignments_Page_MyTasks extends CRM_Core_Page
{
  function run()
  {
    if(!CRM_Utils_System::isUserLoggedIn()) {
      $loginUrl = CRM_Core_Config::singleton()->userSystem->getLoginURL('/civicrm/taskassignments/my-tasks');
      CRM_Utils_System::redirect($loginUrl);
    }

    if (!CRM_Core_Permission::check('access Tasks and Assignments')) {
      CRM_Utils_System::redirect('/dashboard#tasks');
    }
    else {
      CRM_Utils_System::redirect('/civicrm/tasksassignments/dashboard#/tasks/my');
    }

    return FALSE;
  }
}
