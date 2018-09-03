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
  'common/models/relationship-type.model',
  'common/mocks/services/api/relationship-type-mock',
  'tasks-assignments/dashboard/tasks-assignments.dashboard.module'
], function (_, angular, moment, assignmentMockData, optionValuesMockData, assignmentFabricator) {
  'use strict';

  describe('ModalAssignmentController', function () {
    var $controller, $provide, $q, $rootScope, $timeout, assignmentService, contactService, documentService,
      HRSettings, mockedRelationshipType, taskService, RelationshipModel, relationshipTypeApiMock, scope,
      selectedAssignment;
    var defaultAssigneeOptions = optionValuesMockData.getDefaultAssigneeTypes().values;
    var defaultAssigneeOptionsIndex = _.keyBy(defaultAssigneeOptions, 'name');
    var sampleData = {
      date: '2013-01-01',
      contactName: 'Arya Stark'
    };

    beforeEach(module('tasks-assignments.dashboard', 'common.models', 'common.mocks', function (_$provide_) {
      $provide = _$provide_;
    }));

    beforeEach(inject(['api.relationshipType.mock', function (_relationshipTypeApiMock_) {
      relationshipTypeApiMock = _relationshipTypeApiMock_;

      $provide.value('RelationshipTypeAPI', relationshipTypeApiMock);
    }]));

    beforeEach(inject(function (_$q_, _$controller_, $httpBackend, _$rootScope_,
      _$timeout_, _assignmentService_, _documentService_, _taskService_, _RelationshipModel_) {
      var assignmentTypes = assignmentFabricator.assignmentTypes();
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
      mockedRelationshipType = _.first(relationshipTypeApiMock.mockedRelationshipTypes());
      scope = $rootScope.$new();
      selectedAssignment = _.chain(assignmentTypes).values().first().value();
      $rootScope.cache = {
        assignmentType: angular.copy(modelTypesStructure),
        documentType: angular.copy(modelTypesStructure),
        taskType: angular.copy(modelTypesStructure)
      };
      contactService = {
        get: jasmine.createSpy('get').and.returnValue($q.resolve([]))
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
      var caseTypes, expectedWorkflowActivityTypes;
      var CATEGORY_FIELD = 'custom_100';
      var WORKFLOW_TYPE = 'Workflow';

      beforeEach(function () {
        caseTypes = assignmentFabricator.assignmentTypes();
        $rootScope.cache.assignmentType.obj = caseTypes;
        $rootScope.cache.assignmentType.arr = _.values(caseTypes);
        expectedWorkflowActivityTypes = _.values(caseTypes).filter(function (caseType) {
          return caseType[CATEGORY_FIELD] === WORKFLOW_TYPE;
        });
      });

      describe('when the component is initialized', function () {
        beforeEach(function () {
          initController({
            config: { customFieldIds: { 'caseType.category': 100 } }
          });
        });

        it('stores a list of workflow activity types only', function () {
          expect(scope.workflowActivityTypes).toEqual(expectedWorkflowActivityTypes);
        });
      });

      describe('when the assignment types cache is updated', function () {
        beforeEach(function () {
          // start the cache as empty:
          $rootScope.cache.assignmentType = { obj: {}, arr: [] };

          initController({
            config: { customFieldIds: { 'caseType.category': 100 } }
          });

          // populate the cache after the controller has been initialized:
          $rootScope.cache.assignmentType.obj = caseTypes;
          $rootScope.cache.assignmentType.arr = _.values(caseTypes);

          $rootScope.$digest();
        });

        it('updates the list of workflow activity types', function () {
          expect(scope.workflowActivityTypes).toEqual(expectedWorkflowActivityTypes);
        });
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
        activity.activity_type_id = _.uniqueId();
        document = scope.activity.activitySet.activityTypes[1];
        document.activity_type_id = _.uniqueId();
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
        var contact = { id: _.uniqueId() };
        var assignee = { id: _.uniqueId() };

        beforeEach(function () {
          scope.assignment.client_id = contact.id;
          activity.default_assignee_type = defaultAssigneeOptionsIndex.BY_RELATIONSHIP.value;

          spyOn(RelationshipModel, 'allValid');
        });

        describe('when the relationship goes in a single direction', function () {
          describe('when the target contact is the left-hand contact of the relationship', function () {
            beforeEach(function () {
              activity.default_assignee_relationship = mockedRelationshipType.id + '_a_b';

              RelationshipModel.allValid.and.returnValue($q.resolve({
                list: [ { id: _.uniqueId(), contact_id_a: contact.id, contact_id_b: assignee.id } ]
              }));
              $rootScope.$digest();
            });

            it('requests a single relationship where the target contact is on the left-hand of the relationship', function () {
              expect(RelationshipModel.allValid).toHaveBeenCalledWith({
                relationship_type_id: mockedRelationshipType.id,
                contact_id_a: contact.id,
                options: { limit: 1 }
              }, null, null, false);
            });

            it('assigns the contact that belongs to the relationship', function () {
              expect(scope.taskList[0].assignee_contact_id).toEqual([assignee.id]);
            });
          });

          describe('when the target contact is the right-hand contact of the relationship', function () {
            beforeEach(function () {
              activity.default_assignee_relationship = mockedRelationshipType.id + '_b_a';

              RelationshipModel.allValid.and.returnValue($q.resolve({
                list: [ { id: _.uniqueId(), contact_id_a: assignee.id, contact_id_b: contact.id } ]
              }));
              $rootScope.$digest();
            });

            it('requests a single relationship where the target contact is on the right-hand of the relationship', function () {
              expect(RelationshipModel.allValid).toHaveBeenCalledWith({
                relationship_type_id: mockedRelationshipType.id,
                contact_id_b: contact.id,
                options: { limit: 1 }
              }, null, null, false);
            });

            it('assigns the contact that belongs to the relationship', function () {
              expect(scope.taskList[0].assignee_contact_id).toEqual([assignee.id]);
            });
          });
        });

        describe('when the relationships is bidirectional', function () {
          var relationshipType;

          beforeEach(function () {
            var allRelationshipTypes = relationshipTypeApiMock.mockedRelationshipTypes();

            relationshipType = _.find(allRelationshipTypes, { name_a_b: 'Spouse of' });
            activity.default_assignee_relationship = relationshipType.id + '_a_b';
          });

          describe('for both directions', function () {
            beforeEach(function () {
              RelationshipModel.allValid.and.returnValue($q.resolve({
                list: [ { id: _.uniqueId(), contact_id_a: contact.id, contact_id_b: assignee.id } ]
              }));
              $rootScope.$digest();
            });

            it('requests a single relationship where the target contact is either on the left or right-hand of the relationship', function () {
              expect(RelationshipModel.allValid).toHaveBeenCalledWith({
                relationship_type_id: relationshipType.id,
                contact_id_a: contact.id,
                contact_id_b: contact.id,
                options: {
                  or: [['contact_id_a', 'contact_id_b']],
                  limit: 1
                }
              }, null, null, false);
            });
          });

          describe('when the target contact is the left-hand contact of a bidirectional relationship', function () {
            beforeEach(function () {
              RelationshipModel.allValid.and.returnValue($q.resolve({
                list: [ { id: _.uniqueId(), contact_id_a: contact.id, contact_id_b: assignee.id } ]
              }));
              $rootScope.$digest();
            });

            it('assigns the contact that belongs to the relationship', function () {
              expect(scope.taskList[0].assignee_contact_id).toEqual([assignee.id]);
            });
          });

          describe('when the target contact is the right-hand contact of a bidirectional relationship', function () {
            beforeEach(function () {
              RelationshipModel.allValid.and.returnValue($q.resolve({
                list: [ { id: _.uniqueId(), contact_id_a: assignee.id, contact_id_b: contact.id } ]
              }));
              $rootScope.$digest();
            });

            it('assigns the contact that belongs to the relationship', function () {
              expect(scope.taskList[0].assignee_contact_id).toEqual([assignee.id]);
            });
          });
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
        var activityTypeId, expectedRelationshipWarnings;
        var contact = { id: _.uniqueId() };

        beforeEach(function () {
          activityTypeId = _.find($rootScope.cache.taskType.arr, { value: activity.name }).key;
          scope.assignment.client_id = contact.id;
          activity.default_assignee_type = defaultAssigneeOptionsIndex.BY_RELATIONSHIP.value;

          spyOn(RelationshipModel, 'allValid').and.returnValue($q.resolve({
            list: []
          }));
        });

        describe('when the target contact is the left-hand contact of the relationship', function () {
          beforeEach(function () {
            var defaultAssigneeRelationshipValue = mockedRelationshipType.id + '_a_b';

            activity.default_assignee_relationship = defaultAssigneeRelationshipValue;
            expectedRelationshipWarnings = {};
            expectedRelationshipWarnings[activityTypeId] = mockedRelationshipType.label_a_b;

            $rootScope.$digest();
          });

          it('adds the missing relationships to a relationship missing warnings index', function () {
            expect(scope.relationshipMissingWarnings).toEqual(expectedRelationshipWarnings);
          });
        });

        describe('when the target contact is the right-hand contact of the relationship', function () {
          beforeEach(function () {
            var defaultAssigneeRelationshipValue = mockedRelationshipType.id + '_b_a';

            activity.default_assignee_relationship = defaultAssigneeRelationshipValue;
            expectedRelationshipWarnings = {};
            expectedRelationshipWarnings[activityTypeId] = mockedRelationshipType.label_b_a;

            $rootScope.$digest();
          });

          it('adds the missing relationships to a relationship missing warnings index', function () {
            expect(scope.relationshipMissingWarnings).toEqual(expectedRelationshipWarnings);
          });
        });
      });

      describe('when the contact has all its default assignee relationships', function () {
        var hasRelationshipWarning;
        var contact = { id: _.uniqueId() };

        beforeEach(function () {
          scope.assignment.client_id = contact.id;
          activity.default_assignee_type = defaultAssigneeOptionsIndex.BY_RELATIONSHIP.value;
          activity.default_assignee_relationship = mockedRelationshipType.id + '_a_b';

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
          activity.default_assignee_relationship = mockedRelationshipType.id + '_a_b';

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
        activity.default_assignee_relationship = mockedRelationshipType.id + '_a_b';

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
      $rootScope.$digest();
    }

    /**
     * Selects the default client and case type assignations.
     */
    function selectDefaultClientAndAssignation () {
      scope.assignment.client_id = _.uniqueId();
      scope.assignment.case_type_id = selectedAssignment.id;
      scope.activity.activitySet = selectedAssignment.definition.activitySets[0];
    }

    /**
     * Initializes the cache for assignment, tasks, and document types.
     * The activity types are split in half to mock lists of task and document
     * activities for the case. This can be possible since both tasks and documents
     * simply are specialized activities.
     */
    function setupRootScopeCaches () {
      var activityTypes = selectedAssignment.definition.activitySets[0].activityTypes
        .map(function (activityType) {
          return {
            key: _.uniqueId(),
            value: activityType.name
          };
        });
      var documentTypes = activityTypes.slice(activityTypes.length / 2);
      var taskTypes = activityTypes.slice(0, activityTypes.length / 2);

      // setup assignments types:
      $rootScope.cache.assignmentType.obj = assignmentFabricator.assignmentTypes();
      $rootScope.cache.assignmentType.arr = _.values($rootScope.cache.assignmentType.obj);

      // setup document type:
      $rootScope.cache.documentType = {
        obj: _.keyBy(documentTypes, 'key'),
        arr: documentTypes
      };

      // setup task types:
      $rootScope.cache.taskType = {
        obj: _.keyBy(taskTypes, 'key'),
        arr: taskTypes
      };
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
