<?php

use CRM_Tasksassignments_Test_BaseHeadlessTest as BaseHeadlessTest;

/**
 * @group headless
 */
class CRM_Tasksassignments_Hook_PageRun_ResourcesTest extends BaseHeadlessTest {

  public function testAddingTheResourcesToAllowedPages() {
    $resources = $this->prophesize(CRM_Core_Resources::class);
    $hook = new CRM_Tasksassignments_Hook_PageRun_Resources($resources->reveal());
    $allowedPages = [
      CRM_Tasksassignments_Page_Tasks::class,
      CRM_Tasksassignments_Page_Documents::class,
      CRM_Tasksassignments_Page_Dashboard::class,
      CRM_Tasksassignments_Page_Settings::class,
    ];

    $resources->addScriptFile(
      CRM_Tasksassignments_Hook_PageRun_Resources::EXTENSION_KEY,
      'js/dist/tasks-assignments.min.js',
      CRM_Tasksassignments_Hook_PageRun_Resources::REQANGULAR_PRIORITY + 10
    )->shouldBeCalledTimes(count($allowedPages));

    $resources->addStyleFile(
      CRM_Tasksassignments_Hook_PageRun_Resources::EXTENSION_KEY,
      'css/civitasks.css'
    )->shouldBeCalledTimes(count($allowedPages));

    foreach ($allowedPages as $allowedPage) {
      $hook->handle(new $allowedPage());
    }
  }

  public function testNotAddingTheResourcesToPages() {
    $resources = $this->prophesize(CRM_Core_Resources::class);
    $hook = new CRM_Tasksassignments_Hook_PageRun_Resources($resources->reveal());
    $notAllowedPage = new CRM_Core_Page();

    $resources->addScriptFile()->shouldNotBeCalled();
    $resources->addStyleFile()->shouldNotBeCalled();

    $hook->handle($notAllowedPage);
  }

}
