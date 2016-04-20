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
                $modalInstance: modalInstance,
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
                expect(scope.contacts.document_assignee).toEqual([]);
                expect(scope.contacts.task_assignee).toEqual([]);
            });
        });

        describe('copyAssignee()', function () {
            var list, assigneeId = [2];

            beforeEach(function () {
                list = scope.taskList;
                list[0].assignee_contact_id = assigneeId;

                scope.copyAssignee(list);
            });

            it("assigns the assignee's id of the first item to the whole list", function () {
                list.forEach(function (item) {
                    expect(item.assignee_contact_id).toEqual(assigneeId);
                });
            });
        });

        describe('copyDate()', function () {
            var list, activityDate = '2015-05-05';

            beforeEach(function () {
                list = scope.taskList;
                list[0].activity_date_time = activityDate;

                scope.copyDate(list);
            });

            it("assigns the date of the first item to the whole list", function () {
                list.forEach(function (item) {
                    expect(item.activity_date_time).toEqual(activityDate);
                });
            });
        });

    });
});
