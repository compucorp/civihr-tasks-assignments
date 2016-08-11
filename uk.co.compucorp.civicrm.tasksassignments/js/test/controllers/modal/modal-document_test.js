define([
  'common/angular',
  'common/moment',
  'common/angularMocks',
  'tasks-assignments/app'
], function (angular, moment) {
  'use strict';

  describe('ModalDocumentCtrl', function () {
    var ctrl, modalInstance, $controller, $rootScope, $scope, HR_settings, data, files, initController;

    beforeEach(module('civitasks.appDashboard'));
    beforeEach(inject(function (_$controller_, _$rootScope_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();

      HR_settings = { DATE_FORMAT: 'DD/MM/YYYY' };

      data = {};
      files = {};
    }));

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
       * @return {Array}
       */
      function cachedContacts() {
        return [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }];
      }
    });

    describe('$scope.parseDate()', function () {
      beforeEach(function () {
        initController();
      });

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

    describe('$scope.statusFieldVisible', function () {
      beforeEach(function () {
        initController();
      });

      it('starts defined to false', function () {
        expect($scope.statusFieldVisible).toBeFalsy();
      });
    });

    describe('$scope.showStatusField', function () {
      beforeEach(function () {
        initController();
      });

      it('changes "$scope.statusFieldVisible" to true', function () {
        expect($scope.statusFieldVisible).toBeFalsy();
        $scope.showStatusField();
        expect($scope.statusFieldVisible).toBeTruthy();
      });
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

    function initController() {
      ctrl = $controller('ModalDocumentCtrl', {
        $scope: $scope,
        $uibModalInstance: fakeModalInstance(),
        data: data,
        files: files,
        HR_settings: HR_settings
      });
    };
  });
});
