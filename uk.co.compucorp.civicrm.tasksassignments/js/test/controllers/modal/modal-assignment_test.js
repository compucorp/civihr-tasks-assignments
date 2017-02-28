define([
    'common/angular',
    'mocks/assignment',
    'common/angularMocks',
    'tasks-assignments/app'
], function (angular, Mock) {
    'use strict';

    describe('ModalAssignmentCtrl', function () {
        var ctrl, modalInstance, scope, AssignmentService, TaskService, DocumentService, ContactService, HR_settings;

        beforeEach(module('civitasks.appDashboard'));
        beforeEach(inject(function ($controller, $rootScope) {
            modalInstance = {
                close: jasmine.createSpy('modalInstance.close'),
                dismiss: jasmine.createSpy('modalInstance.dismiss'),
                result: {
                    then: jasmine.createSpy('modalInstance.result.then')
                }
            };

            scope = $rootScope.$new();

            AssignmentService = {};
            TaskService = {};
            DocumentService = {};
            ContactService = {};
            HR_settings = {
                DATE_FORMAT: 'DD/MM/YYYY'
            };

            ctrl = $controller('ModalAssignmentCtrl', {
                $scope: scope,
                $uibModalInstance: modalInstance,
                AssignmentService: AssignmentService,
                TaskService: TaskService,
                DocumentService: DocumentService,
                ContactService: ContactService,
                data: {},
                config: {},
                settings: {},
                HR_settings: HR_settings
            });

            angular.extend(scope, Mock);
        }));

        describe('Lookup contacts lists', function () {
            it('has the lists empty', function () {
                expect(scope.contacts.target).toEqual([]);
                expect(scope.contacts.document).toEqual([]);
                expect(scope.contacts.task).toEqual([]);
            });
        });

        describe('copyAssignee()', function () {
          var assigneeId = [2];

          beforeEach(function () {
            _.assign(scope.taskList[0], { create: false, assignee_contact_id: [3] });
            _.assign(scope.taskList[1], { create: false, assignee_contact_id: [1] });
            _.assign(scope.taskList[2], { create: true, assignee_contact_id: assigneeId });
            _.assign(scope.taskList[4], { create: false });

            fillContactsCollectionOf(scope.taskList, 'task');
            scope.copyAssignee(scope.taskList, 'task');
          });

          describe('assignee id', function () {
            it("assigns the assignee id of the first enabled item to the other enabled items", function () {
              scope.taskList.filter(function (item) {
                return item.create;
              }).forEach(function (item) {
                expect(item.assignee_contact_id).toEqual(assigneeId);
              });
            });

            it('does not assign the assignee id to the disabled items', function () {
              scope.taskList.filter(function (item) {
                return !item.create;
              }).forEach(function (item) {
                expect(item.assignee_contact_id).not.toEqual(assigneeId);
              });
            });
          });

          describe('contact collection', function () {
            it('copies the contacts collection of the first enabled item to the other items', function () {
              scope.taskList.forEach(function (item, index) {
                if (item.create) {
                  expect(scope.contacts.task[index]).toEqual(scope.contacts.task[2]);
                }
              });
            });

            it('does not copy the contacts collection to the disabled items', function () {
              scope.taskList.forEach(function (item, index) {
                if (item.create) {
                  expect(scope.contacts.task[index]).toEqual(scope.contacts.task[2]);
                }
              });
            });
          });
        });

        describe('copyDate()', function () {
          var activityDate = '2015-05-05';

          beforeEach(function () {
            _.assign(scope.taskList[0], { create: false, activity_date_time: '2013-01-01' });
            _.assign(scope.taskList[1], { create: false, activity_date_time: '2014-01-01' });
            _.assign(scope.taskList[2], { create: true, activity_date_time: activityDate });
            _.assign(scope.taskList[4], { create: false });

            scope.copyDate(scope.taskList);
          });

          it("assigns the date of the first enabled item to the whole list", function () {
            scope.taskList.filter(function (item) {
              return item.create;
            }).forEach(function (item) {
              expect(item.activity_date_time).toEqual(activityDate);
            });
          });

          it("does not assign the date to the disabled items", function () {
            scope.taskList.filter(function (item) {
              return !item.create;
            }).forEach(function (item) {
              expect(item.activity_date_time).not.toEqual(activityDate);
            });
          });
        });

        /**
         * Fills up with random placeholder data the contacts collection of the
         * given list
         *
         * @param {Array} list
         * @param {string} type - task or document
         */
        function fillContactsCollectionOf(list, type) {
            list.forEach(function (item, index) {
                scope.contacts[type][index] = _.range(_.random(5)).map(function () {
                    return { id: _.uniqueId() };
                })
            });
        }
    });
});
