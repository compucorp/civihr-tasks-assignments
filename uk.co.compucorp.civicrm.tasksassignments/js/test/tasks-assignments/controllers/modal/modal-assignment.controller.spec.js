/* eslint-env amd, jasmine */

define([
  'common/lodash',
  'common/angular',
  'common/moment',
  'mocks/data/assignment.data',
  'mocks/data/option-values.data',
  'mocks/fabricators/assignment.fabricator',
  'common/angularMocks',
  'common/models/relationship.model',
  'tasks-assignments/modules/tasks-assignments.dashboard.module'
], function (_, angular, moment, assignmentMockData, optionValuesMockData, assignmentFabricator) {
  'use strict';

  describe('ModalAssignmentController', function () {
    var $controller, $q, $rootScope, $timeout, assignmentService, contactService, documentService,
      HRSettings, taskService, RelationshipModel, scope;
    var defaultAssigneeOptions = optionValuesMockData.getDefaultAssigneeTypes().values;
    var defaultAssigneeOptionsIndex = _.indexBy(defaultAssigneeOptions, 'name');
    var sampleData = {
      date: '2013-01-01',
      contactName: 'Arya Stark'
    };

    beforeEach(module('tasks-assignments.dashboard'));
    beforeEach(inject(function (_$q_, _$controller_, $httpBackend, _$rootScope_,
      _$timeout_, _assignmentService_, _documentService_, _taskService_, _RelationshipModel_) {
      var modelTypesStructure = { obj: {}, arr: [] };

      // A workaround to avoid actual API calls
      $httpBackend.whenGET(/action=/).respond({});

      $q = _$q_;
      $controller = _$controller_;
      $timeout = _$timeout_;
      assignmentService = _assignmentService_;
      documentService = _documentService_;
      taskService = _taskService_;
      RelationshipModel = _RelationshipModel_;
      $rootScope = _$rootScope_;
      HRSettings = { DATE_FORMAT: 'DD/MM/YYYY' };
      contactService = {
        get: jasmine.createSpy('get').and.returnValue($q.resolve([]))
      };

      scope = $rootScope.$new();

      $rootScope.cache = {
        assignmentType: angular.copy(modelTypesStructure),
        documentType: angular.copy(modelTypesStructure),
        taskType: angular.copy(modelTypesStructure)
      };

      initController({ defaultAssigneeOptions: defaultAssigneeOptions });
      angular.extend(scope, assignmentMockData);
    }));

    describe('on init', function () {
      var resolvedData = { foo: 'foo' };

      beforeEach(function () {
        initController({ data: resolvedData });
      });

      it('copies the passed data in the $scope assignment object', function () {
        expect(scope.assignment.foo).toBe(resolvedData.foo);
      });
    });

    describe('workflow activity types', function () {
      var expectedWorkflowActivityTypes;

      beforeEach(function () {
        var caseTypes = assignmentFabricator.assignmentTypes();
        var CATEGORY_FIELD = 'custom_100';
        var WORKFLOW_TYPE = 'Workflow';

        $rootScope.cache.assignmentType.obj = caseTypes;
        $rootScope.cache.assignmentType.arr = _.values(caseTypes);
        expectedWorkflowActivityTypes = _.values(caseTypes).filter(function (caseType) {
          return caseType[CATEGORY_FIELD] === WORKFLOW_TYPE;
        });

        initController({
          config: { customFieldIds: { 'caseType.category': 100 } }
        });
      });

      it('stores a list of workflow activity types only', function () {
        expect(scope.workflowActivityTypes).toEqual(expectedWorkflowActivityTypes);
      });
    });

    describe('Lookup contacts lists', function () {
      it('has the lists empty', function () {
        expect(scope.contacts.target).toEqual([]);
        expect(scope.contacts.document).toEqual([]);
        expect(scope.contacts.task).toEqual([]);
      });
    });

    describe('confirm()', function () {
      var expectedDocumentsParameters, expectedTasksParameters;
      var expectedCaseId = _.uniqueId();
      var expectedContactId = _.uniqueId();

      beforeEach(function () {
        spyOn($q, 'all').and.returnValue({ then: _.noop });
        spyOn(taskService, 'saveMultiple');
        spyOn(documentService, 'saveMultiple');
        spyOn(assignmentService, 'save').and.returnValue({
          then: function (callback) {
            // fakes the db permanence, attaching an id to the assignment on the scope
            callback(_.assign(_.clone(scope.assignment), { id: expectedCaseId }));
          }
        });
      });

      beforeEach(function () {
        prepAssignment();

        expectedDocumentsParameters = getActivitiesToBeSentToAPI(scope.documentList);
        expectedTasksParameters = getActivitiesToBeSentToAPI(scope.taskList);

        scope.confirm();
      });

      it('saves every document', function () {
        expect(documentService.saveMultiple).toHaveBeenCalledWith(expectedDocumentsParameters);
      });

      it('saves every task', function () {
        expect(taskService.saveMultiple).toHaveBeenCalledWith(expectedTasksParameters);
      });

      /**
       * Returns a list of activities containing the fields required by their
       * respective services. It will only return activities marked for creation.
       *
       * @param {Array} activities a list of activities missing their assignee and case IDs.
       *
       * @return {Array}
       */
      function getActivitiesToBeSentToAPI (activities) {
        return _.chain(activities)
          .cloneDeep()
          .filter(function (activity) {
            return activity.create;
          })
          .map(function (activity) {
            activity.assignee_id = _.first(activity.assignee_contact_id);
            activity.case_id = expectedCaseId;

            return activity;
          })
          .value();
      }

      /**
       * Prepares the assignment data to pass the confirm() validation
       */
      function prepAssignment () {
        _.assign(scope.assignment, {
          contact_id: jasmine.any(Number),
          case_type_id: jasmine.any(Number),
          dueDate: jasmine.any(Date)
        });

        scope.taskList.forEach(function (task) {
          _.assign(task, {
            assignee_contact_id: [ expectedContactId ],
            activity_date_time: sampleData.date
          });
        });
      }
    });

    describe('copyAssignee()', function () {
      var assigneeId = [_.uniqueId()];

      beforeEach(function () {
        _.assign(scope.taskList[0], { create: false, assignee_contact_id: [_.uniqueId()] });
        _.assign(scope.taskList[1], { create: false, assignee_contact_id: [_.uniqueId()] });
        _.assign(scope.taskList[2], { create: true, assignee_contact_id: assigneeId });
        _.assign(scope.taskList[4], { create: false });

        fillContactsCollectionOf(scope.taskList, 'task');
        scope.copyAssignee(scope.taskList, 'task');
      });

      describe('assignee id', function () {
        it('assigns the assignee id of the first enabled item to the other enabled items', function () {
          scope.taskList.filter(function (item) {
            return item.create;
          }).forEach(function (item) {
            expect(item.assignee_contact_id).toEqual(assigneeId);
          });
        });

        it('does not assign the assignee id to the disabled items', function () {
          scope.taskList.filter(function (item) {
            return !item.create;
          }).forEach(function (item) {
            expect(item.assignee_contact_id).not.toEqual(assigneeId);
          });
        });
      });

      describe('contact collection', function () {
        it('copies the contacts collection of the first enabled item to the other items', function () {
          scope.taskList.forEach(function (item, index) {
            if (item.create) {
              expect(scope.contacts.task[index]).toEqual(scope.contacts.task[2]);
            }
          });
        });

        it('does not copy the contacts collection to the disabled items', function () {
          scope.taskList.forEach(function (item, index) {
            if (item.create) {
              expect(scope.contacts.task[index]).toEqual(scope.contacts.task[2]);
            }
          });
        });
      });
    });

    describe('copyDate()', function () {
      var expectedActivityDate = moment(sampleData.date).add(2, 'year').format('YYYY-MM-DD');

      beforeEach(function () {
        _.assign(scope.taskList[0], { create: false, activity_date_time: sampleData.date });
        _.assign(scope.taskList[1], { create: false, activity_date_time: sampleData.date });
        _.assign(scope.taskList[2], { create: true, activity_date_time: expectedActivityDate });
        _.assign(scope.taskList[4], { create: false });

        scope.copyDate(scope.taskList);
      });

      it('assigns the date of the first enabled item to the whole list', function () {
        scope.taskList.filter(function (item) {
          return item.create;
        }).forEach(function (item) {
          expect(item.activity_date_time).toEqual(expectedActivityDate);
        });
      });

      it('does not assign the date to the disabled items', function () {
        scope.taskList.filter(function (item) {
          return !item.create;
        }).forEach(function (item) {
          expect(item.activity_date_time).not.toEqual(expectedActivityDate);
        });
      });
    });

    describe('updateTimeline()', function () {
      var newActivitySet;

      describe('when activity types exist', function () {
        beforeEach(function () {
          newActivitySet = assignmentMockData.timeline[0];
          scope.updateTimeline(newActivitySet);
          scope.$digest();
        });

        it('updates taskList according with activitySet', function () {
          expect(scope.activity.activitySet).toEqual(newActivitySet);
        });
      });

      describe('when activity types do not exist', function () {
        beforeEach(function () {
          newActivitySet = assignmentMockData.timeline[1];
          scope.updateTimeline(newActivitySet);
          scope.$digest();
        });

        it('defines an empty array for taskList', function () {
          expect(scope.taskList).toEqual([]);
        });
      });
    });

    describe('setData()', function () {
      var caseTypeId = _.uniqueId();

      beforeEach(function () {
        scope.assignment.case_type_id = caseTypeId;

        $rootScope.cache.assignmentType.obj[caseTypeId] = {
          definition: {
            activitySets: [
              {
                'name': 'standard_timeline',
                'label': 'Standard Timeline',
                'timeline': '1',
                'activityTypes': []
              },
              {
                'name': 'standard_timeline',
                'label': 'Standard Timeline',
                'timeline': '1',
                'activityTypes': []
              }
            ]
          }
        };

        scope.setData();
      });

      it('sets the selected activity type', function () {
        expect(scope.activity.activitySet)
          .toEqual($rootScope.cache.assignmentType.obj[caseTypeId].definition.activitySets[0]);
      });
    });

    describe('watchers', function () {
      describe('Assignment Type cache', function () {
        var caseTypeId;

        beforeEach(function () {
          var mockedTypes = assignmentFabricator.assignmentTypes();

          caseTypeId = Object.keys(mockedTypes)[0];

          scope.assignment.subject = '';
          scope.assignment.case_type_id = caseTypeId;

          $rootScope.cache.assignmentType.obj[caseTypeId] = mockedTypes[caseTypeId];
          // remove the activit sets to avoid triggering another watcher
          $rootScope.cache.assignmentType.obj[caseTypeId].definition.activitySets = [];

          $rootScope.$digest();
        });

        it('automatically sets the data associated with the case type of the assignment', function () {
          expect(scope.assignment.subject).toBe($rootScope.cache.assignmentType.obj[caseTypeId].title);
        });
      });
    });

    describe('when the target contact changes', function () {
      var assigneeId = _.uniqueId();

      beforeEach(function () {
        scope.assignment.client_id = _.uniqueId();
        scope.assignment.contact_id = _.uniqueId();
        scope.taskList = [{ id: _.uniqueId() }];
        scope.activity.activitySet = {
          activityTypes: [{
            id: _.uniqueId(),
            default_assignee_type: defaultAssigneeOptionsIndex.SPECIFIC_CONTACT.value,
            default_assignee_contact: assigneeId
          }]
        };

        scope.onTargetContactChange();
        $rootScope.$digest();
      });

      it('assigns the contact id to the client id', function () {
        expect(scope.assignment.client_id).toBe(scope.assignment.contact_id);
      });

      it('loads the default assignees related to the new target contact', function () {
        expect(scope.taskList[0].assignee_contact_id).toEqual([assigneeId]);
      });
    });

    describe('selecting the default assignee', function () {
      var activity, document;
      var loggedInContactId = _.uniqueId();

      beforeEach(function () {
        var documentType;

        setupRootScopeCaches();
        initController({
          defaultAssigneeOptions: defaultAssigneeOptions,
          session: { contactId: loggedInContactId }
        });
        selectDefaultClientAndAssignation();

        documentType = $rootScope.cache.assignmentType.arr[1];
        activity = scope.activity.activitySet.activityTypes[0];
        document = scope.activity.activitySet.activityTypes[1];
        document.name = documentType.name;
      });

      describe('when the default assignee is a specific contact', function () {
        var assigneeId = _.uniqueId();

        beforeEach(function () {
          activity.default_assignee_type = defaultAssigneeOptionsIndex.SPECIFIC_CONTACT.value;
          activity.default_assignee_contact = assigneeId;

          $rootScope.$digest();
        });

        it('assigns the contact to the task', function () {
          expect(scope.taskList[0].assignee_contact_id).toEqual([assigneeId]);
        });
      });

      describe('when the default assignee is the user creating the tasks', function () {
        beforeEach(function () {
          activity.default_assignee_type = defaultAssigneeOptionsIndex.USER_CREATING_THE_CASE.value;

          $rootScope.$digest();
        });

        it('assigns the current logged in user to the task', function () {
          expect(scope.taskList[0].assignee_contact_id).toEqual([loggedInContactId]);
        });
      });

      describe('when the default assignee is set to be no one', function () {
        beforeEach(function () {
          activity.default_assignee_type = defaultAssigneeOptionsIndex.NONE.value;

          $rootScope.$digest();
        });

        it('does not assign anyone to the task', function () {
          expect(scope.taskList[0].assignee_contact_id).toEqual(null);
        });
      });

      describe('when the default assignee type is not known', function () {
        beforeEach(function () {
          activity.default_assignee_type = undefined;

          $rootScope.$digest();
        });

        it('does not assign anyone to the task', function () {
          expect(scope.taskList[0].assignee_contact_id).toEqual(null);
        });
      });

      describe('when the default assignee type is determined by a relationship', function () {
        var contact = { id: _.uniqueId(), contact_id: _.uniqueId() };
        var assignee = { id: _.uniqueId() };

        beforeEach(function () {
          scope.assignment.client_id = contact.contact_id;
          activity.default_assignee_type = defaultAssigneeOptionsIndex.BY_RELATIONSHIP.value;
          activity.default_assignee_relationship = _.uniqueId();

          spyOn(RelationshipModel, 'allValid').and.returnValue($q.resolve({
            list: [ { id: _.uniqueId(), contact_id_a: contact.id, contact_id_b: assignee.id } ]
          }));

          $rootScope.$digest();
        });

        it('assigns the contact that belongs to the relationship', function () {
          expect(scope.taskList[0].assignee_contact_id).toEqual([assignee.id]);
        });
      });

      describe('after selecting a default assignee', function () {
        var contact = {
          contact_id: _.uniqueId(),
          display_name: sampleData.contactName,
          id: _.uniqueId()
        };

        beforeEach(function () {
          activity.default_assignee_type = defaultAssigneeOptionsIndex.SPECIFIC_CONTACT.value;
          activity.default_assignee_contact = contact.id;
          document.default_assignee_type = defaultAssigneeOptionsIndex.SPECIFIC_CONTACT.value;
          document.default_assignee_contact = contact.id;

          contactService.get.and.returnValue($q.resolve([ contact ]));
          $rootScope.$digest();
        });

        it('requests the contact data', function () {
          expect(contactService.get).toHaveBeenCalledWith({ IN: [ contact.id ] });
        });

        it('caches the contact id and name of the task assignee', function () {
          expect(scope.contacts.task[0]).toEqual([{
            id: contact.contact_id,
            label: contact.display_name
          }]);
        });

        it('caches the contact id and name of the document assignee', function () {
          expect(scope.contacts.document[0]).toEqual([{
            id: contact.contact_id,
            label: contact.display_name
          }]);
        });
      });

      describe('when the contact is missing a relationship defined as default', function () {
        var hasRelationshipWarning;
        var contact = { id: _.uniqueId() };

        beforeEach(function () {
          scope.assignment.client_id = contact.id;
          activity.default_assignee_type = defaultAssigneeOptionsIndex.BY_RELATIONSHIP.value;
          activity.default_assignee_relationship = _.uniqueId();

          spyOn(RelationshipModel, 'allValid').and.returnValue($q.resolve({
            list: []
          }));
          $rootScope.$digest();

          hasRelationshipWarning = _.chain(scope.relationshipMissingWarnings)
            .values().indexOf(activity.default_assignee_relationship).value() >= 0;
        });

        it('adds the missing relationships to an relationship missing warnings index', function () {
          expect(hasRelationshipWarning).toBe(true);
        });
      });

      describe('when the contact has all its default assignee relationships', function () {
        var hasRelationshipWarning;
        var contact = { id: _.uniqueId() };

        beforeEach(function () {
          scope.assignment.client_id = contact.id;
          activity.default_assignee_type = defaultAssigneeOptionsIndex.BY_RELATIONSHIP.value;
          activity.default_assignee_relationship = _.uniqueId();

          spyOn(RelationshipModel, 'allValid').and.returnValue($q.resolve({
            list: [{ id: _.uniqueId() }]
          }));
          $rootScope.$digest();

          hasRelationshipWarning = _.values(scope.relationshipMissingWarnings).length > 0;
        });

        it('does not add any warnings to the relationship warnings object', function () {
          expect(hasRelationshipWarning).toBe(false);
        });
      });

      describe('when the target contact has not been selected', function () {
        var hasRelationshipWarning;

        beforeEach(function () {
          scope.assignment.client_id = null;
          activity.default_assignee_type = defaultAssigneeOptionsIndex.BY_RELATIONSHIP.value;
          activity.default_assignee_relationship = _.uniqueId();

          spyOn(RelationshipModel, 'allValid').and.returnValue($q.resolve({
            list: []
          }));
          $rootScope.$digest();

          hasRelationshipWarning = _.values(scope.relationshipMissingWarnings).length > 0;
        });

        it('does not add any warnings to the relationship warnings object', function () {
          expect(hasRelationshipWarning).toBe(false);
        });
      });
    });

    describe('hasRelationshipWarnings()', function () {
      describe('when there are relationship warnings', function () {
        beforeEach(function () {
          scope.relationshipMissingWarnings = { 1: 'HR Manager' };
        });

        it('returns true', function () {
          expect(scope.hasRelationshipWarnings()).toBe(true);
        });
      });

      describe('when there are no relationship warnings', function () {
        beforeEach(function () {
          scope.relationshipMissingWarnings = {};
        });

        it('returns true', function () {
          expect(scope.hasRelationshipWarnings()).toBe(false);
        });
      });
    });

    describe('createRelationshipForTargetContact()', function () {
      var activity, expectedFormUrl;
      var assignee = { id: _.uniqueId() };
      var contact = { id: _.uniqueId() };

      beforeEach(function () {
        setupRootScopeCaches();
        initController({
          defaultAssigneeOptions: defaultAssigneeOptions,
          session: { contactId: _.uniqueId() }
        });
        selectDefaultClientAndAssignation();

        activity = scope.activity.activitySet.activityTypes[0];

        // set default assignee by relationship:
        activity.default_assignee_type = defaultAssigneeOptionsIndex.BY_RELATIONSHIP.value;
        activity.default_assignee_relationship = _.uniqueId();

        spyOn(RelationshipModel, 'allValid').and.returnValue($q.resolve({
          list: [ { id: _.uniqueId(), contact_id_a: contact.id, contact_id_b: assignee.id } ]
        }));
        spyOn(CRM, 'loadForm').and.returnValue({
          on: function (eventName, callback) {
            eventName === 'crmFormSuccess' && callback();
            $timeout.flush();
          }
        });

        expectedFormUrl = CRM.url('civicrm/contact/view/rel', {
          action: 'add',
          cid: contact.id
        });

        scope.assignment.client_id = contact.id;
        scope.createRelationshipForTargetContact();

        $rootScope.$digest();
      });

      it('loads the relationship form for the current selected contact', function () {
        expect(CRM.loadForm).toHaveBeenCalledWith(expectedFormUrl);
      });

      it('reloads the default assignees on success', function () {
        expect(scope.taskList[0].assignee_contact_id).toEqual([assignee.id]);
      });

      it('does not cache the request for the relationships', function () {
        expect(RelationshipModel.allValid).toHaveBeenCalledWith(jasmine.any(Object), null, null, false);
      });
    });

    /**
     * Fills up the contacts collection of the given list
     * with random placeholder data
     *
     * @param {array} list
     * @param {string} type - task or document
     */
    function fillContactsCollectionOf (list, type) {
      list.forEach(function (item, index) {
        scope.contacts[type][index] = _.range(_.random(5)).map(function () {
          return { id: _.uniqueId() };
        });
      });
    }

    /**
     * Initializes ModalAssignmentController controller
     *
     * @param {Object} resolvedValues mocked resolved values to pass to the controller for
     * the activity data, session, and default assignee options.
     */
    function initController (resolvedValues) {
      resolvedValues = _.defaultsDeep(resolvedValues || {}, {
        config: { customFieldIds: {} },
        data: {},
        defaultAssigneeOptions: [],
        session: { contactId: _.uniqueId() }
      });

      $controller('ModalAssignmentController', {
        $scope: scope,
        $rootScope: $rootScope,
        assignmentService: assignmentService,
        taskService: taskService,
        documentService: documentService,
        contactService: contactService,
        data: resolvedValues.data,
        defaultAssigneeOptions: resolvedValues.defaultAssigneeOptions,
        session: resolvedValues.session,
        config: resolvedValues.config,
        settings: {
          tabEnabled: {
            documents: '1',
            keyDates: '1'
          }
        },
        HR_settings: HRSettings,
        $uibModalInstance: {
          close: jasmine.createSpy('modalInstance.close'),
          dismiss: jasmine.createSpy('modalInstance.dismiss'),
          result: {
            then: jasmine.createSpy('modalInstance.result.then')
          }
        }
      });
    }

    /**
     * Selects the default client and case type assignations.
     */
    function selectDefaultClientAndAssignation () {
      var selectedAssignment = $rootScope.cache.assignmentType.arr[0];

      scope.assignment.client_id = _.uniqueId();
      scope.assignment.case_type_id = selectedAssignment.id;
      scope.activity.activitySet = selectedAssignment.definition.activitySets[0];
    }

    /**
     * Initializes the cache for assignment and document types.
     */
    function setupRootScopeCaches () {
      var documentType;

      // setup assignments types:
      $rootScope.cache.assignmentType.obj = assignmentFabricator.assignmentTypes();
      $rootScope.cache.assignmentType.arr = _.values($rootScope.cache.assignmentType.obj);

      // setup document type:
      documentType = $rootScope.cache.assignmentType.arr[1];
      $rootScope.cache.documentType.arr = [{ key: documentType.id, value: documentType.name }];
    }
  });

  describe('ModalAssignmentActivityController', function () {
    var $controller, scope;

    beforeEach(module('tasks-assignments.dashboard'));
    beforeEach(inject(function (_$controller_, $httpBackend, $rootScope) {
      $httpBackend.whenPOST(/action=/).respond({});
      $httpBackend.whenGET(/action=/).respond({});

      $controller = _$controller_;

      scope = $rootScope.$new();
      scope.activity = assignmentMockData.taskList[0];
      scope.$parent.assignment = {
        contact_id: 1,
        dueDate: '2017-01-01'
      };

      initController();
    }));

    describe('watching assignment properties', function () {
      describe('assignment due date', function () {
        var oldDate;

        beforeEach(function () {
          oldDate = scope.activity.activity_date_time;
          scope.$parent.assignment.dueDate = '2017-10-10';
        });

        describe('when the task is enabled', function () {
          beforeEach(function () {
            scope.activity.create = true;
            scope.$digest();
          });

          it('updates the task date', function () {
            expect(scope.activity.activity_date_time).not.toBe(oldDate);
          });
        });

        describe('when the task is not enabled', function () {
          beforeEach(function () {
            scope.activity.create = false;
            scope.$digest();
          });

          it('does not update the task date', function () {
            expect(scope.activity.activity_date_time).toBe(oldDate);
          });
        });
      });

      describe('assignment contact id', function () {
        var oldContactId;

        beforeEach(function () {
          oldContactId = scope.activity.target_contact_id;
          scope.$parent.assignment.contact_id = _.uniqueId();
        });

        describe('when the task is enabled', function () {
          beforeEach(function () {
            scope.activity.create = true;
            scope.$digest();
          });

          it('updates the task target contact id', function () {
            expect(scope.activity.target_contact_id).toEqual([scope.$parent.assignment.contact_id]);
          });
        });

        describe('when the task is not enabled', function () {
          beforeEach(function () {
            scope.activity.create = false;
            scope.$digest();
          });

          it('does not update the task target contact id', function () {
            expect(scope.activity.target_contact_id).toBe(oldContactId);
            expect(scope.activity.target_contact_id).not.toEqual([scope.$parent.assignment.contact_id]);
          });
        });
      });
    });

    function initController () {
      $controller('ModalAssignmentActivityController', {
        $scope: scope
      });
    }
  });
});
