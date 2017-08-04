<?php

require_once 'CRM/Core/DAO.php';
require_once 'CRM/Utils/Type.php';
class CRM_Tasksassignments_DAO_Assignment extends CRM_Case_BAO_Case {
  public static function &fields() {
    if (!isset(Civi::$statics[__CLASS__]['fields'])) {
      Civi::$statics[__CLASS__]['fields'] = parent::fields();
      Civi::$statics[__CLASS__]['fields']['id'] = Civi::$statics[__CLASS__]['fields']['case_id'];
      unset(Civi::$statics[__CLASS__]['fields']['case_id']);
    }

    return Civi::$statics[__CLASS__]['fields'];
  }
}
