<?php

use CRM_Tasksassignments_Test_BaseHeadlessTest as BaseHeadlessTest;

/**
 * @group headless
 */
class CRM_Tasksassignments_Hook_PageRun_ResourcesTest extends BaseHeadlessTest {

  public function testAddingTheResourcesToAllowedPages() {
    $resources = $this->prophesize('CRM_Core_Resources');
    $hook = new CRM_Tasksassignments_Hook_PageRun_Resources($resources->reveal());
    $allowedPages = [
      'CRM_Tasksassignments_Page_Tasks',
      'CRM_Tasksassignments_Page_Documents',
      'CRM_Tasksassignments_Page_Dashboard',
      'CRM_Tasksassignments_Page_Settings',
    ];

    foreach ($allowedPages as $allowedPage) {
      $hook->handle(new $allowedPage());
    }

    $resources->addScriptFile('uk.co.compucorp.civicrm.tasksassignments',
      'js/dist/tasks-assignments.min.js', 1010)
      ->shouldBeCalledTimes(count($allowedPages));
    $resources->addStyleFile('uk.co.compucorp.civicrm.tasksassignments',
      'css/civitasks.css')
      ->shouldBeCalledTimes(count($allowedPages));
  }

  public function testNotAddingTheResourcesToPages() {
    $resources = $this->prophesize('CRM_Core_Resources');
    $hook = new CRM_Tasksassignments_Hook_PageRun_Resources($resources->reveal());
    $notAllowedPage = new CRM_Core_Page();

    $hook->handle($notAllowedPage);

    $resources->addScriptFile()->shouldNotBeCalled();
    $resources->addStyleFile()->shouldNotBeCalled();
  }

}
