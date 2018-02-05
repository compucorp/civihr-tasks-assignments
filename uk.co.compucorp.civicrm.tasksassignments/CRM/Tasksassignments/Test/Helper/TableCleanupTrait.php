<?php

trait CRM_Tasksassignments_Test_Helper_TableCleanupTrait {

  /**
   * @param array $tables
   *   A list of table to truncate
   */
  private function truncateTables($tables) {
    CRM_Core_DAO::executeQuery('SET FOREIGN_KEY_CHECKS = 0');
    foreach ($tables as $table) {
      CRM_Core_DAO::executeQuery(sprintf('TRUNCATE %s', $table));
    }
    CRM_Core_DAO::executeQuery('SET FOREIGN_KEY_CHECKS = 1');
  }
}
