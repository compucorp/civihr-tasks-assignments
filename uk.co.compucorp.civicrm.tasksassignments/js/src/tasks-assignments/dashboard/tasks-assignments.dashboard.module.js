/* eslint-env amd */

define([
  'common/angular',
  'tasks-assignments/dashboard/controllers/calendar.controller',
  'tasks-assignments/dashboard/controllers/date-list.controller',
  'tasks-assignments/dashboard/controllers/external-page.controller',
  'tasks-assignments/dashboard/controllers/nav-main.controller',
  'tasks-assignments/dashboard/controllers/top-bar.controller',
  'tasks-assignments/dashboard/filters/contact-id.filter',
  'tasks-assignments/dashboard/filters/date.filter',
  'tasks-assignments/dashboard/filters/date-type.filter',
  'tasks-assignments/dashboard/filters/offset.filter',
  'tasks-assignments/dashboard/services/key-date.resource',
  'tasks-assignments/dashboard/services/key-date.service',
  'tasks-assignments/dashboard/tasks-assignments.dashboard.core',
  'tasks-assignments/dashboard/tasks-assignments.dashboard.config',
  'tasks-assignments/dashboard/tasks-assignments.dashboard.constants'
], function (angular, CalendarController, DateListController, ExternalPageController,
  NavMainController, TopBarController, filterByContactId, filterByDate, filterByDateType,
  offset, KeyDate, keyDateService) {
  'use strict';

  angular.module('tasks-assignments.dashboard', [
    'tasks-assignments.dashboard.core',
    'tasks-assignments.dashboard.config',
    'tasks-assignments.dashboard.constants'
  ])
    .controller(CalendarController)
    .controller(DateListController)
    .controller(ExternalPageController)
    .controller(NavMainController)
    .controller(TopBarController)
    .filter(filterByContactId)
    .filter(filterByDate)
    .filter(filterByDateType)
    .filter(offset)
    .factory(KeyDate)
    .factory(keyDateService);
});
