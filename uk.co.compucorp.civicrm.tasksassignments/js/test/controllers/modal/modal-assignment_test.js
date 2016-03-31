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
        }));

        it('Controller should be defined', function () {
            expect(ctrl).toBeDefined()
        });

        describe('Bulk Assign', function(){
            beforeEach(function(){
                angular.extend(scope, Mock);
            });

            it('Test copyAssignee method', function(){
                var list = scope.taskList;

                list[0].assignee_contact_id = [2];

                expect(list[1].assignee_contact_id).toEqual([]);
                expect(list[2].assignee_contact_id).toEqual([]);

                scope.copyAssignee(list);

                expect(list[1].assignee_contact_id).toEqual([2]);
                expect(list[2].assignee_contact_id).toEqual([2]);
            });

            it('Test copyDate method', function(){
                var list = scope.taskList;

                list[0].activity_date_time = '2015-05-05';

                expect(list[1].activity_date_time).toEqual('');
                expect(list[2].activity_date_time).toEqual('');

                scope.copyDate(list);

                expect(list[1].activity_date_time).toEqual('2015-05-05');
                expect(list[2].activity_date_time).toEqual('2015-05-05');
            });
        });

    });
});
