define([
    'common/angular',
    'common/moment',
    'common/angularMocks',
    'tasks-assignments/app'
], function (angular, moment) {
    'use strict';

    describe('ModalTaskCtrl', function () {
        var ctrl, modalInstance, $controller, $rootScope, $scope, HR_settings,
            data, initController;

        beforeEach(module('civitasks.appDashboard'));
        beforeEach(inject(function (_$rootScope_, _$controller_) {
            $controller = _$controller_;
            $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            data = {};
            HR_settings = { DATE_FORMAT: 'DD/MM/YYYY' };

            initializeCaches();
        }));

        describe('Task should have a default (pre-filled) date.', function () {
            describe('Task has not due date set.', function () {
                beforeEach(function () {
                    initController();
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

                    initController();
                });

                it("date shouldn't be changed if task already has a due date", function () {
                    expect(moment($scope.task.activity_date_time).isSame(moment(), 'day')).toBe(false);
                });

                it("due date should be exactly the same as date passed to controller", function () {
                    expect(moment($scope.task.activity_date_time).isSame(customDate)).toBe(true);
                });
            });
        });

        describe('Lookup contacts lists', function () {
            describe('when in "new task" mode', function () {
                beforeEach(function () {
                    initController();
                });

                it('has the lists empty', function () {
                    expect($scope.contacts.assignee).toEqual([]);
                    expect($scope.contacts.target).toEqual([]);
                });
            });

            describe('when in "edit task" mode', function () {
                beforeEach(function () {
                    data = { id: '2', assignee_contact_id: '3', target_contact_id: '1' };
                    $rootScope.cache.contact.arrSearch = cachedContacts();

                    initController();
                });

                it('has the list filled with just the contacts linked to the task', function () {
                    expect($scope.contacts.assignee).toEqual([{ id: '3' }]);
                    expect($scope.contacts.target).toEqual([{ id: '1' }]);
                });
            });

            /**
             * A mocked list of cached contacts
             *
             * @return {Array}
             */
            function cachedContacts() {
                return [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }];
            }
        });

        function fakeModalInstance() {
            return {
                close: jasmine.createSpy('modalInstance.close'),
                dismiss: jasmine.createSpy('modalInstance.dismiss'),
                result: {
                    then: jasmine.createSpy('modalInstance.result.then')
                }
            };
        }

        function initController () {
            ctrl = $controller('ModalTaskCtrl', {
                $rootScope: $rootScope,
                $scope: $scope,
                $uibModalInstance: fakeModalInstance(),
                data: data,
                HR_settings: HR_settings
            });
        };

        function initializeCaches() {
            $rootScope.cache = {
                assignment: { arrSearch: [] },
                contact: { arrSearch: [] }
            };
        }
    });
});
