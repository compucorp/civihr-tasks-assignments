<?php

class CRM_Tasksassignments_Hook_PageRun_Resources {
  /**
   * @var string
   *   The key for the T&W extension.
   */
  const EXTENSION_KEY = 'uk.co.compucorp.civicrm.tasksassignments';

  /**
   * @var int
   *   The priority value for the reqangular.min.js file, which this extension depends on.
   */
  const REQANGULAR_PRIORITY = 1000;

  /**
   * @var CRM_Core_Resources
   *   Stores the provided Core Resources instance.
   */
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

    $isDevEnvironment = CRM_Core_Config::singleton()->debug;
    $scriptFile = $isDevEnvironment ? 'js/src/tasks-assignments.js' : 'js/dist/tasks-assignments.min.js';

    $this->resources->addScriptFile(
      self::EXTENSION_KEY,
      $scriptFile,
      self::REQANGULAR_PRIORITY + 10 // so it's after reqangular
    );

    $this->resources->addStyleFile(
      self::EXTENSION_KEY,
      'css/civitasks.css'
    );
  }

  /**
   * Determines if the hook should add the resources depending on the page
   * being requested.
   *
   * @param CRM_Core_Page $page
   */
  public function shouldHandle($page) {
    $pageClassName = get_class($page);
    $pagesWhereTheResourcesAreUsed = [
      CRM_Tasksassignments_Page_Tasks::class,
      CRM_Tasksassignments_Page_Documents::class,
      CRM_Tasksassignments_Page_Dashboard::class,
      CRM_Tasksassignments_Page_Settings::class,
    ];

    return in_array($pageClassName, $pagesWhereTheResourcesAreUsed);
  }

}
