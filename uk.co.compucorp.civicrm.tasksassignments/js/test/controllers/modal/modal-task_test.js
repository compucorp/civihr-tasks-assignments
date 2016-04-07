define([
    'common/angular',
    'common/moment',
    'common/angularMocks',
    'tasks-assignments/app'
], function (angular, moment) {
    'use strict';

    describe('ModalTaskCtrl', function () {
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

            ctrl = $controller('ModalTaskCtrl', {
                $scope: scope,
                $modalInstance: modalInstance,
                data: {},
                HR_settings: HR_settings
            });
        }));

        describe('Task should have a default (pre-filled) date.', function () {

            it('task has a default due date', function () {
                expect(scope.task.activity_date_time).toBeDefined();
            });

            it('default date should be set to today', function(){
                expect(moment(scope.task.activity_date_time).isSame(moment(), 'day')).toBe(true);
            })
        });
    });
});
