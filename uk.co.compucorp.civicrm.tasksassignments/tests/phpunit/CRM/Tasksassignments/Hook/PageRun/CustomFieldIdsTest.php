<?php

use CRM_Tasksassignments_Test_BaseHeadlessTest as BaseHeadlessTest;

/**
 * @group headless
 */
class CRM_Tasksassignments_Hook_PageRun_CustomFieldIdsTest extends BaseHeadlessTest {

  public function testAddingTheCustomFieldIdsVarToAllowedPages() {
    $resources = $this->prophesize(CRM_Core_Resources::class);
    $hook = new CRM_Tasksassignments_Hook_PageRun_CustomFieldIds($resources->reveal());
    $allowedPage = new Civi\Angular\Page\Main();
    $caseTypeCategoryFieldId = CRM_Core_BAO_CustomField::getCustomFieldID('category', 'case_type_category');

    $resources->addVars('customFieldIds', [
      'caseType.category' => $caseTypeCategoryFieldId,
    ])
      ->shouldBeCalled();

    $hook->handle($allowedPage);
  }

  public function testNotAddingTheCustomIdsVarToPages() {
    $resources = $this->prophesize(CRM_Core_Resources::class);
    $hook = new CRM_Tasksassignments_Hook_PageRun_CustomFieldIds($resources->reveal());
    $notAllowedPage = new CRM_Core_Page();
    $caseTypeCategoryFieldId = CRM_Core_BAO_CustomField::getCustomFieldID('category', 'case_type_category');

    $resources->addVars('customFieldIds', [
      'caseType.category' => $caseTypeCategoryFieldId,
    ])->shouldNotBeCalled();

    $hook->handle($notAllowedPage);
  }

}
