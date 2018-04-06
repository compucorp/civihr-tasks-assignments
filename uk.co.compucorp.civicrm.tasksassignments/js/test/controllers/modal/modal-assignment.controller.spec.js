/* eslint-env amd, jasmine */

define([
  'common/lodash',
  'common/angular',
  'mocks/data/assignment.data',
  'mocks/data/option-values.data',
  'mocks/fabricators/assignment.fabricator',
  'common/angularMocks',
  'common/models/relationship.model',
  'tasks-assignments/modules/tasks-assignments.dashboard.module'
], function (_, angular, assignmentMockData, optionValuesMockData, assignmentFabricator) {
  'use strict';

  describe('ModalAssignmentController', function () {
    var $controller, $q, $rootScope, assignmentService, contactService, documentService,
      HRSettings, taskService, RelationshipModel, scope;
    var defaultAssigneeOptions = optionValuesMockData.getDefaultAssigneeTypes().values;
    var defaultAssigneeOptionsIndex = _.indexBy(defaultAssigneeOptions, 'name');

    beforeEach(module('tasks-assignments.dashboard'));
    beforeEach(inject(function (_$q_, _$controller_, $httpBackend, _$rootScope_,
      _assignmentService_, _documentService_, _taskService_, _RelationshipModel_) {
      var modelTypesStructure = { obj: {}, arr: [] };

      // A workaround to avoid actual API calls
      $httpBackend.whenGET(/action=/).respond({});

      $q = _$q_;
      $controller = _$controller_;
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

    describe('Lookup contacts lists', function () {
      it('has the lists empty', function () {
        expect(scope.contacts.target).toEqual([]);
        expect(scope.contacts.document).toEqual([]);
        expect(scope.contacts.task).toEqual([]);
      });
    });

    describe('confirm()', function () {
      beforeEach(function () {
        spyOn($q, 'all').and.returnValue({ then: _.noop });
        spyOn(taskService, 'saveMultiple');
        spyOn(documentService, 'saveMultiple');
        spyOn(assignmentService, 'save').and.returnValue({
          then: function (callback) {
            // fakes the db permanence, attaching an id to the assignment on the scope
            callback(_.assign(_.clone(scope.assignment), { id: _.uniqueId() }));
          }
        });
      });
      beforeEach(function () {
        prepAssignment();
        scope.confirm() && scope.$digest();
      });

      it('does not pass the original documents objects to the documentService', function () {
        var documents = documentService.saveMultiple.calls.mostRecent().args[0];

        expect(documents.every(function (doc, index) {
          return doc !== scope.taskList[index];
        })).toBe(true);
      });

      it('does not pass the original tasks objects to the taskService', function () {
        var tasks = taskService.saveMultiple.calls.mostRecent().args[0];

        expect(tasks.every(function (task, index) {
          return task !== scope.taskList[index];
        })).toBe(true);
      });

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
          _.assign(task, { activity_date_time: '2013-01-01', assignee_contact_id: [3] });
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
      var activityDate = '2015-05-05';

      beforeEach(function () {
        _.assign(scope.taskList[0], { create: false, activity_date_time: '2013-01-01' });
        _.assign(scope.taskList[1], { create: false, activity_date_time: '2014-01-01' });
        _.assign(scope.taskList[2], { create: true, activity_date_time: activityDate });
        _.assign(scope.taskList[4], { create: false });

        scope.copyDate(scope.taskList);
      });

      it('assigns the date of the first enabled item to the whole list', function () {
        scope.taskList.filter(function (item) {
          return item.create;
        }).forEach(function (item) {
          expect(item.activity_date_time).toEqual(activityDate);
        });
      });

      it('does not assign the date to the disabled items', function () {
        scope.taskList.filter(function (item) {
          return !item.create;
        }).forEach(function (item) {
          expect(item.activity_date_time).not.toEqual(activityDate);
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
      var activityType;
      var loggedInContactId = _.uniqueId();

      beforeEach(function () {
        initController({
          defaultAssigneeOptions: defaultAssigneeOptions,
          session: { contactId: loggedInContactId }
        });

        $rootScope.cache.assignmentType.obj = assignmentFabricator.assignmentTypes();
        $rootScope.cache.assignmentType.arr = _.values($rootScope.cache.assignmentType.obj);
        scope.assignment.case_type_id = $rootScope.cache.assignmentType.arr[0].id;
        scope.activity.activitySet = $rootScope.cache.assignmentType.arr[0].definition.activitySets[0];
        activityType = scope.activity.activitySet.activityTypes[0];
      });

      describe('when the default assignee is a specific contact', function () {
        var assigneeId = _.uniqueId();

        beforeEach(function () {
          activityType.default_assignee_type = defaultAssigneeOptionsIndex.SPECIFIC_CONTACT.value;
          activityType.default_assignee_contact = assigneeId;

          $rootScope.$digest();
        });

        it('assigns the contact to the task', function () {
          expect(scope.taskList[0].assignee_contact_id).toEqual([assigneeId]);
        });
      });

      describe('when the default assignee is the user creating the tasks', function () {
        beforeEach(function () {
          activityType.default_assignee_type = defaultAssigneeOptionsIndex.USER_CREATING_THE_CASE.value;

          $rootScope.$digest();
        });

        it('assigns the current logged in user to the task', function () {
          expect(scope.taskList[0].assignee_contact_id).toEqual([loggedInContactId]);
        });
      });

      describe('when the default assignee is set to be no one', function () {
        beforeEach(function () {
          activityType.default_assignee_type = defaultAssigneeOptionsIndex.NONE.value;

          $rootScope.$digest();
        });

        it('does not assign anyone to the task', function () {
          expect(scope.taskList[0].assignee_contact_id).toEqual(null);
        });
      });

      describe('when the default assignee type is not known', function () {
        beforeEach(function () {
          activityType.default_assignee_type = undefined;

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
          activityType.default_assignee_type = defaultAssigneeOptionsIndex.BY_RELATIONSHIP.value;
          activityType.default_assignee_relationship = _.uniqueId();

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
        var contact = { id: _.uniqueId(), display_name: 'Jon Snow' };

        beforeEach(function () {
          activityType.default_assignee_type = defaultAssigneeOptionsIndex.SPECIFIC_CONTACT.value;
          activityType.default_assignee_contact = contact.id;

          contactService.get.and.returnValue($q.resolve([ contact ]));
          $rootScope.$digest();
        });

        it('requests the contact data', function () {
          expect(contactService.get).toHaveBeenCalledWith({ IN: [ contact.id ] });
        });

        it('caches the id and name of the assignee', function () {
          expect(scope.contacts.task[0]).toEqual([{
            id: contact.id,
            label: contact.display_name
          }]);
        });
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
        config: {},
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
  });
});
