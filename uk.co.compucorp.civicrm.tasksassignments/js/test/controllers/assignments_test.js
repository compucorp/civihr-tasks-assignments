define([
    'common/angularMocks',
    'tasks-assignments/app'
], function () {
    'use strict';

    describe('AssignmentsCtrl', function () {
        var ctrl;

        beforeEach(module('civitasks.appDashboard'));
        beforeEach(inject(function ($controller, $rootScope) {
            ctrl = $controller('AssignmentsCtrl', { $scope: $rootScope.$new() });
        }));

        it('is a simple test', function () {
            expect(true).toBe(true);
        });
    });
});
