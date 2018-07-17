<?php

class CRM_Tasksassignments_Hook_PageRun_Resources {

  private $resources;

  /**
   * @param CRM_Core_Resources $resources
   */
  public function __construct(CRM_Core_Resources $resources) {
    $this->resources = $resources;
  }

  /**
   * Adds resources needed by specific Task and Workflow pages.
   *
   * @param CRM_Core_Page $page
   */
  public function handle($page) {
    if (!$this->shouldHandle($page)) {
      return;
    }

    $this->resources->addScriptFile('uk.co.compucorp.civicrm.tasksassignments',
        CRM_Core_Config::singleton()->debug
          ? 'js/src/tasks-assignments.js'
          : 'js/dist/tasks-assignments.min.js',
        1010
      );

    $this->resources->addStyleFile('uk.co.compucorp.civicrm.tasksassignments',
      'css/civitasks.css');
  }

  /**
   * Determines if the hook should add the resources depending on the page
   * being requested.
   *
   * @param CRM_Core_Page $page
   */
  public function shouldHandle($page) {
    $pageClassName = get_class($page);
    $pagesWhereTheResourceIsDefined = [
      'CRM_Tasksassignments_Page_Tasks',
      'CRM_Tasksassignments_Page_Documents',
      'CRM_Tasksassignments_Page_Dashboard',
      'CRM_Tasksassignments_Page_Settings',
    ];

    return in_array($pageClassName, $pagesWhereTheResourceIsDefined);
  }

}
