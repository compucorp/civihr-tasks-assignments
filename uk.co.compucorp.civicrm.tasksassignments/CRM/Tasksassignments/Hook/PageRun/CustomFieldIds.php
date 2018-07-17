<?php

class CRM_Tasksassignments_Hook_PageRun_CustomFieldIds {

  private $resources;

  /**
   * @param CRM_Core_Resources $resources
   */
  public function __construct(CRM_Core_Resources $resources) {
    $this->resources = $resources;
  }

  /**
   * Provides the IDs for custom fields needed by specific Task and Workflow pages.
   *
   * @param CRM_Core_Page $page
   */
  public function handle($page) {
    if (!$this->shouldHandle($page)) {
      return;
    }

    $this->resources->addVars('customFieldIds', [
      'caseType.category' => CRM_Core_BAO_CustomField::getCustomFieldID('category', 'case_type_category'),
    ]);
  }

  /**
   * Determines if the hook should add the custom field ids definition depending
   * on the page being requested.
   *
   * @param CRM_Core_Page $page
   */
  public function shouldHandle($page) {
    $pageClassName = get_class($page);
    $pageWhereTheVarIsDefined = 'Civi\Angular\Page\Main';

    return $pageClassName === $pageWhereTheVarIsDefined;
  }

}
