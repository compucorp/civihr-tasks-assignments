<?php

use CRM_Tasksassignments_Test_BaseHeadlessTest as BaseHeadlessTest;

/**
 * @group headless
 */
class CRM_Tasksassignments_Hook_PageRun_CustomFieldIdsTest extends BaseHeadlessTest {

  public function testAddingTheCustomFieldIdsVarToAllowedPages() {
    $resources = $this->prophesize('CRM_Core_Resources');
    $hook = new CRM_Tasksassignments_Hook_PageRun_CustomFieldIds($resources->reveal());
    $allowedPage = new Civi\Angular\Page\Main();

    $hook->handle($allowedPage);

    $resources->addVars('customFieldIds', [
      'caseType.category' => CRM_Core_BAO_CustomField::getCustomFieldID('category', 'case_type_category'),
    ])
      ->shouldBeCalled();
  }

  public function testNotAddingTheCustomIdsVarToPages() {
    $resources = $this->prophesize('CRM_Core_Resources');
    $hook = new CRM_Tasksassignments_Hook_PageRun_CustomFieldIds($resources->reveal());
    $notAllowedPage = new CRM_Core_Page();

    $hook->handle($notAllowedPage);

    $resources->addVars('customFieldIds', [
      'caseType.category' => CRM_Core_BAO_CustomField::getCustomFieldID('category', 'case_type_category'),
    ])->shouldNotBeCalled();
  }

}
