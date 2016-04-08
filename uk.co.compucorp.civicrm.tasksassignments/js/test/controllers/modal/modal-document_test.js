define([
    'common/angular',
    'common/moment',
    'common/angularMocks',
    'tasks-assignments/app'
], function (angular, moment) {
    'use strict';

    describe('ModalDocumentCtrl', function () {
        var ctrl, modalInstance, $scope, HR_settings, data, files, initController;

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
                return $controller('ModalDocumentCtrl', {
                    $scope: $scope,
                    $modalInstance: fakeModalInstance(),
                    data: data,
                    files: files,
                    HR_settings: HR_settings
                });
            };

            $scope = $rootScope.$new();

            HR_settings = {
                DATE_FORMAT: 'DD/MM/YYYY'
            };

            data = {};
            files = {};

            ctrl = initController();
        }));

        describe('$scope.parseDate()', function () {
            it('should correctly parse valid date', function () {
                // dd/mm/yyyy
                expect($scope.parseDate('01/01/2005')).toBe('2005-01-01');
                // yyyy-mm-dd
                expect($scope.parseDate('2005-01-01')).toBe('2005-01-01');
                // date object
                expect($scope.parseDate(new Date(2005, 0, 1))).toBe('2005-01-01');
                // timestamp
                expect($scope.parseDate(new Date(2005, 0, 1).getTime())).toBe('2005-01-01');
            });

            it('should not parse invalid date', function () {
                expect($scope.parseDate(null)).toBe(null);
                expect($scope.parseDate(undefined)).toBe(null);
                expect($scope.parseDate(false)).toBe(null);
            });
        });
    });
});
