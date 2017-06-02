/* globals define, inject, CRM */
/* eslint-env jasmine */

define([
  'common/angular',
  'common/moment',
  'mocks/document',
  'common/angularMocks',
  'tasks-assignments/app'
], function (angular, moment, documentMock) {
  'use strict';

  describe('ModalDocumentCtrl', function () {
    var $controller, $rootScope, $filter, $scope, HRSettings, data, role, files, sampleAssignee;

    beforeEach(module('civitasks.appDashboard'));
    beforeEach(inject(function (_$controller_, _$rootScope_, _$filter_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $filter = _$filter_;
      $scope = $rootScope.$new();

      HRSettings = { DATE_FORMAT: 'DD/MM/YYYY' };
      sampleAssignee = {
        id: 5,
        label: 'sample label',
        icon_class: 'fa fa-plus',
        description: 'this is sample desc'
      };

      data = {};
      files = {};
      role = '';
    }));

    describe('init()', function () {
      beforeEach(function () {
        data = documentMock.document;
        initController();
      });

      it('corectly formats date time in document', function () {
        expect($scope.document.activity_date_time).toEqual(new Date(documentMock.document.activity_date_time));
        expect($scope.document.expire_date).toEqual(new Date(documentMock.document.expire_date));
        expect($scope.document.valid_from).toEqual(new Date(documentMock.document.valid_from));
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
       * @return {Array}
       */
      function cachedContacts () {
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

    describe('addAssignee()', function () {
      beforeEach(function () {
        initController();
        addAssignee(sampleAssignee);
      });

      it('adds contacts to list of assignees', function () {
        expect($scope.document.assignee_contact_id[0]).toBe(sampleAssignee.id);
      });

      it('adds assignee to contact search list', function () {
        expect($rootScope.cache.contact.arrSearch[0].id).toEqual(sampleAssignee.id);
        expect($rootScope.cache.contact.arrSearch[0].label).toEqual(sampleAssignee.label);
      });
    });

    describe('removeAssignee()', function () {
      beforeEach(function () {
        initController();
        addAssignee(sampleAssignee);
      });

      it('removes assignee form the list of assignees', function () {
        expect($scope.document.assignee_contact_id.length).toEqual(1);
        $scope.removeAssignee(0);
        expect($scope.document.assignee_contact_id.length).toEqual(0);
      });
    });

    describe('remindMeInfo()', function () {
      beforeEach(function () {
        initController();
        spyOn(CRM, 'help');
        $scope.remindMeInfo();
      });

      it('makes calls to CRM.help() to display help message', function () {
        expect(CRM.help).toHaveBeenCalledWith('Remind me?', $scope.remindMeMessage, 'error');
      });
    });

    describe('$scope.role', function () {
      beforeEach(function () {
        initController();
      });

      it('defaults to as admin', function () {
        expect($scope.role).toBe('admin');
      });
    });

    describe('isRole()', function () {
      beforeEach(function () {
        initController();
        $scope.role = 'staff';
      });

      it('returns truthy value for correct username', function () {
        expect($scope.isRole('staff')).toBeTruthy();
      });

      it('returns falsy value for correct username', function () {
        expect($scope.isRole('admin')).toBeFalsy();
      });
    });

    function addAssignee (assignee) {
      $scope.addAssignee(assignee);
    }

    function fakeModalInstance () {
      return {
        close: jasmine.createSpy('modalInstance.close'),
        dismiss: jasmine.createSpy('modalInstance.dismiss'),
        result: {
          then: jasmine.createSpy('modalInstance.result.then')
        }
      };
    }

    function initController () {
      $controller('ModalDocumentCtrl', {
        $scope: $scope,
        $filter: $filter,
        $uibModalInstance: fakeModalInstance(),
        data: data,
        files: files,
        role: role,
        HR_settings: HRSettings
      });
    }
  });
});
