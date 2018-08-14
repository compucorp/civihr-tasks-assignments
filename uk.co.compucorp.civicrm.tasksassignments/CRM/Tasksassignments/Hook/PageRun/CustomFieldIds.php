<?php

class CRM_Tasksassignments_Hook_PageRun_CustomFieldIds {

  /**
   * @var CRM_Core_Resources
   *   stores the provided Core Resources instance.
   */
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

    $caseTypeCategoryFieldId = CRM_Core_BAO_CustomField::getCustomFieldID(
      'category',
      'case_type_category'
    );

    $this->resources->addVars('customFieldIds', [
      'caseType.category' => $caseTypeCategoryFieldId,
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
    $pagesWhereTheVarsAreDefined = [
      CRM_Tasksassignments_Page_Dashboard::class,
      Civi\Angular\Page\Main::class
    ];

    return in_array($pageClassName, $pagesWhereTheVarsAreDefined);
  }

}
