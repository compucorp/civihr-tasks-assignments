/* eslint-env jasmine */
/* global angular */

(function () {
  'use strict';

  describe('CaseTypeExtendedController', function () {
    var $controller, $log, $rootScope, $scope, CaseTypeCtrl, parentControllerSpy,
      TaskActivityOptionsData, DocumentActivityOptionsData;
    var CASE_TYPE_CATEGORY_FIELD_ID = 200;

    beforeEach(module('crm-tasks-workflows.mocks', 'crm-tasks-workflows.controllers', function ($controllerProvider, $provide) {
      createParentCaseTypeCtrlMock($controllerProvider);

      $provide.value('customFieldIds', {
        'caseType.category': CASE_TYPE_CATEGORY_FIELD_ID
      });
    }));

    beforeEach(inject(function (_$controller_, _$log_, _$rootScope_, _TaskActivityOptionsData_, _DocumentActivityOptionsData_) {
      $controller = _$controller_;
      $log = _$log_;
      $rootScope = _$rootScope_;
      DocumentActivityOptionsData = _DocumentActivityOptionsData_;
      TaskActivityOptionsData = _TaskActivityOptionsData_;
      $scope = $rootScope.$new();

      spyOn($log, 'debug');
      initController();
    }));

    describe('when initialized', function () {
      var expectedApiCalls;

      beforeEach(function () {
        expectedApiCalls = { actTypes: { values: getActivityTypes() } };
      });

      it('initialises the parent controller with activity types having component labels', function () {
        expect(parentControllerSpy).toHaveBeenCalledWith(jasmine.objectContaining(expectedApiCalls));
      });

      describe('default relationship options', function () {
        var expectedRelationshipOptions;

        beforeEach(function () {
          var mockRelationships = getSeveralMockRelationships(4);

          mockRelationships[2].is_active = '0';
          expectedRelationshipOptions = getExpectedRelationshipOptions(mockRelationships);

          initController($scope, {
            apiCalls: {
              relTypes: {
                values: mockRelationships
              }
            }
          });
        });

        it('should store the default assignee relationship type options', function () {
          expect($scope.defaultRelationshipTypeOptions).toEqual(expectedRelationshipOptions);
        });

        /**
         * Returns a list of expected relationship options. The options consists of
         * active relationship types only and the label and value for the relationship type.
         * Normally, two options are added for each relationship type (Ex: Parent of, Child of), but
         * for bidirectional relationship types only one option is added (Ex: Spouse of).
         *
         * @param  {Array} relationshipTypes - a list of relationship types to use as base for the options.
         * @return {Array}
         */
        function getExpectedRelationshipOptions (relationshipTypes) {
          var expectedRelationshipOptions = [];

          getActiveRelationshipTypes(relationshipTypes)
            .forEach(function (relationshipType) {
              var isBidirectionalRelationship = relationshipType.label_a_b === relationshipType.label_b_a;

              expectedRelationshipOptions.push({
                label: relationshipType.label_b_a,
                value: relationshipType.id + '_b_a'
              });

              if (!isBidirectionalRelationship) {
                expectedRelationshipOptions.push({
                  label: relationshipType.label_a_b,
                  value: relationshipType.id + '_a_b'
                });
              }
            });

          return expectedRelationshipOptions;
        }

        /**
         * Returns only active relationship types.
         *
         * @param  {Array} relationshipTypes - a list of relationship types.
         * @return {Array}
         */
        function getActiveRelationshipTypes (relationshipTypes) {
          return relationshipTypes.filter(function (relationshipType) {
            return relationshipType.is_active === '1';
          });
        }
      });

      describe('default case type category value', function () {
        var categoryField = 'custom_' + CASE_TYPE_CATEGORY_FIELD_ID;
        var expectedCategory = 'Vacancy';

        describe('when creating a new case type', function () {
          beforeEach(function () {
            var caseType = getMockCaseType();

            initController($scope, {
              apiCalls: { caseType: caseType },
              defaultCaseTypeCategory: expectedCategory
            });
          });

          it('sets the default case type category equal to Workflow', function () {
            expect($scope.caseType[categoryField]).toEqual(expectedCategory);
          });
        });

        describe('when updating an existing case type', function () {
          beforeEach(function () {
            var caseType = getMockCaseType();
            caseType.id = 100;
            caseType[categoryField] = expectedCategory;

            initController($scope, {
              apiCalls: { caseType: caseType },
              defaultCaseTypeCategory: expectedCategory
            });
          });

          it('does not override their current category', function () {
            expect($scope.caseType[categoryField]).toEqual(expectedCategory);
          });
        });
      });
    });

    describe('when creating a new case type', function () {
      beforeEach(function () {
        initController($scope);
      });

      it('clears all activities from the main activity set', function () {
        expect($scope.caseType.definition.activitySets[0].activityTypes).toEqual([]);
      });
    });

    describe('when editing an existing case type', function () {
      var caseType = getMockCaseType();

      beforeEach(function () {
        caseType.id = 100;

        initController($scope, {
          apiCalls: { caseType: caseType }
        });
      });

      it('does not clear the activity types from the main activity set', function () {
        expect($scope.caseType.definition.activitySets[0].activityTypes).not.toEqual([]);
      });
    });

    describe('addActivity', function () {
      var activityTypes, activityType;
      var addActivityInParent = jasmine.createSpy('addActivityInParent');

      beforeEach(function () {
        $scope.addActivity = addActivityInParent;

        activityTypes = getActivityTypes();
        activityTypes[0].reference_activity = '1';
        activityType = activityTypes[0].name;

        initController($scope);
        $scope.addActivity({ activityTypes: activityTypes }, activityType);
      });

      it('calls the parent function', function () {
        expect(addActivityInParent).toHaveBeenCalledWith({ activityTypes: activityTypes }, activityType);
      });

      it('removes the reference property for the activity type', function () {
        expect(activityTypes[0].reference_activity).toBeUndefined();
      });
    });

    /**
     * Creates a mock controller for the parent case type controller. It also
     * adds a spy to check the api calls parameter passed to the parent.
     *
     * @param {Object} $controllerProvider AngularJS' controller provider.
     */
    function createParentCaseTypeCtrlMock ($controllerProvider) {
      var defaultCaseType = getMockCaseType();

      parentControllerSpy = jasmine.createSpy('parentControllerSpy');

      // mocks the original CaseTypeCtrl:
      CaseTypeCtrl = ['$scope', 'crmApi', 'apiCalls', function ($scope, crmApi,
        apiCalls) {
        parentControllerSpy(apiCalls);

        $scope.caseType = apiCalls.caseType ? apiCalls.caseType : defaultCaseType;
      }];

      $controllerProvider.register('CaseTypeCtrl', CaseTypeCtrl);
    }

    /**
     * Initialise the controller
     *
     * @param {Object} scope - an optional custom $scope to pass to the controller.
     * @param {Object} dependencies - allows overriding any dependency required by the controller.
     */
    function initController (scope, dependencies) {
      var defaultApiCalls, defaultDependencies;

      $scope = scope || $rootScope.$new();
      defaultApiCalls = {
        relTypes: { values: [] }
      };
      defaultDependencies = {
        $scope: $scope,
        crmApi: {},
        defaultCaseTypeCategory: 'Workflow',
        activityOptionsTask: { values: angular.copy(TaskActivityOptionsData) },
        activityOptionsDocument: { values: angular.copy(DocumentActivityOptionsData) }
      };

      dependencies = angular.extend(defaultDependencies, dependencies);
      dependencies.apiCalls = angular.extend(defaultApiCalls, dependencies.apiCalls);

      $controller('CaseTypeExtendedController', dependencies);

      $scope.$digest();
    }

    /**
     * Get list of activity types with component type added to label
     *
     * @return {Array} activity types
     */
    function getActivityTypes () {
      var taskOptions = TaskActivityOptionsData.map(function (type) {
        type.label = (type.label + ' (Task)');

        return type;
      });

      var documentOptions = DocumentActivityOptionsData.map(function (document) {
        document.label = (document.label + ' (Document)');

        return document;
      });

      return taskOptions.concat(documentOptions);
    }

    /**
     * Returns a mock for Case Types
     *
     * @return {Object}
     */
    function getMockCaseType () {
      return {
        definition: {
          activitySets: [{
            activityTypes: [{ name: 'Open Case', status: 'Completed' }]
          }]
        }
      };
    }

    /**
     * Returns a list of mock relationship types up to the number provided.
     *
     * @param  {Number} howMany - the number of mock relationship types to return.
     * @return {Array}
     */
    function getSeveralMockRelationships (howMany) {
      return Array.apply(null, { length: howMany })
        .map(function (relationship, index) {
          return {
            id: index,
            is_active: '1'
          };
        });
    }
  });
})();
