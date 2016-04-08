define([
    'common/angular',
    'common/moment',
    'common/angularMocks',
    'tasks-assignments/app'
], function (angular, moment) {
    'use strict';

    describe('ModalTaskCtrl', function () {
        var ctrl, modalInstance, $scope, HR_settings, data, initController;

        function fakeModalInstance() {
            return {
                close: jasmine.createSpy('modalInstance.close'),
                dismiss: jasmine.createSpy('modalInstance.dismiss'),
                result: {
                    then: jasmine.createSpy('modalInstance.result.then')
                }
            };
        }

        beforeEach(module('civitasks.appDashboard'));

        beforeEach(inject(function ($rootScope, $controller) {

            initController = function (){
                return $controller('ModalTaskCtrl', {
                    $scope: $scope,
                    $modalInstance: fakeModalInstance(),
                    data: data,
                    HR_settings: HR_settings
                });
            };

            $scope = $rootScope.$new();

            HR_settings = {
                DATE_FORMAT: 'DD/MM/YYYY'
            };

            data = {};
        }));

        describe('Task should have a default (pre-filled) date.', function () {

            describe('Task has not due date set.', function () {

                beforeEach(function () {
                    ctrl = initController();
                });

                it('task has a default due date', function () {
                    expect($scope.task.activity_date_time).toBeDefined();
                });

                it('default date should be set to today', function () {
                    expect(moment($scope.task.activity_date_time).isSame(moment(), 'day')).toBe(true);
                });
            });

            describe('Task already has due date set.', function () {
                var customDate;

                beforeEach(function () {
                    customDate = moment().subtract(7, 'days').toDate();
                    data.activity_date_time = customDate;

                    ctrl = initController();
                });

                it("date shouldn't be changed if task already has a due date", function () {
                    expect(moment($scope.task.activity_date_time).isSame(moment(), 'day')).toBe(false);
                });

                it("due date should be exactly the same as date passed to controller", function () {
                    expect(moment($scope.task.activity_date_time).isSame(customDate)).toBe(true);
                });
            });
        });
    });
});
