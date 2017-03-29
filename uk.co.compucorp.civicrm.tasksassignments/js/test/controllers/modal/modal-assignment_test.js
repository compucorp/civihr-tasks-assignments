define([
  'common/lodash',
  'common/angular',
  'mocks/assignment',
  'common/angularMocks',
  'tasks-assignments/app'
], function (_, angular, Mock) {
    'use strict';

    describe('ModalAssignmentCtrl', function () {
        var $q, $controller, ctrl, modalInstance, scope, AssignmentService,
          TaskService, DocumentService, ContactService, HR_settings;

        beforeEach(module('civitasks.appDashboard'));
        beforeEach(inject(function (_$q_, _$controller_, $httpBackend, $rootScope, _AssignmentService_, _DocumentService_, _TaskService_) {
          // A workaround to avoid actual API calls
          $httpBackend.whenGET(/action=/).respond({});

          $q = _$q_;
          $controller = _$controller_;
          AssignmentService = _AssignmentService_;
          DocumentService = _DocumentService_;
          TaskService = _TaskService_;
          ContactService = {};
          HR_settings = { DATE_FORMAT: 'DD/MM/YYYY'};

          scope = $rootScope.$new();

          initController();
          angular.extend(scope, Mock);
        }));

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
            spyOn(TaskService, 'saveMultiple');
            spyOn(DocumentService, 'saveMultiple');
            spyOn(AssignmentService, 'save').and.returnValue({ then: function (cb) {
              // fakes the db permanence, attaching an id to the assignment on the scope
              cb(_.assign(_.clone(scope.assignment), { id: _.uniqueId() }));
            }});
          });
          beforeEach(function () {
            prepAssignment();
            scope.confirm() && scope.$digest();
          });

          it('does not pass the original documents objects to the DocumentService', function () {
            var documents = DocumentService.saveMultiple.calls.mostRecent().args[0];

            expect(documents.every(function (doc, index) {
              return doc !== scope.taskList[index];
            })).toBe(true);
          });

          it('does not pass the original tasks objects to the TaskService', function () {
            var tasks = TaskService.saveMultiple.calls.mostRecent().args[0];

            expect(tasks.every(function (task, index) {
              return task !== scope.taskList[index];
            })).toBe(true);
          });

          /**
           * Prepares the assignment data to pass the confirm() validation
           */
          function prepAssignment() {
            _.assign(scope.assignment, {
              contact_id: jasmine.any(Number),
              case_type_id: jasmine.any(Number),
              dueDate: jasmine.any(Date),
            });

            scope.taskList.forEach(function (task) {
              _.assign(task, { activity_date_time: '2013-01-01', assignee_contact_id: [3] });
            });
          }
        });

        describe('copyAssignee()', function () {
          var assigneeId = [2];

          beforeEach(function () {
            _.assign(scope.taskList[0], { create: false, assignee_contact_id: [3] });
            _.assign(scope.taskList[1], { create: false, assignee_contact_id: [1] });
            _.assign(scope.taskList[2], { create: true, assignee_contact_id: assigneeId });
            _.assign(scope.taskList[4], { create: false });

            fillContactsCollectionOf(scope.taskList, 'task');
            scope.copyAssignee(scope.taskList, 'task');
          });

          describe('assignee id', function () {
            it("assigns the assignee id of the first enabled item to the other enabled items", function () {
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

          it("assigns the date of the first enabled item to the whole list", function () {
            scope.taskList.filter(function (item) {
              return item.create;
            }).forEach(function (item) {
              expect(item.activity_date_time).toEqual(activityDate);
            });
          });

          it("does not assign the date to the disabled items", function () {
            scope.taskList.filter(function (item) {
              return !item.create;
            }).forEach(function (item) {
              expect(item.activity_date_time).not.toEqual(activityDate);
            });
          });
        });

        describe('updateTimeline()', function () {
          var newActivitySet;

          it('should update taskList according with activitySet', function () {
            newActivitySet = Mock.timeline[0];
            scope.updateTimeline(newActivitySet);
            scope.$digest();
            expect(scope.activitySet).toEqual(newActivitySet);
          });

          it('should set an empty array for taskList if doens\'t exist activityTypes', function () {
            newActivitySet = Mock.timeline[1];
            scope.updateTimeline(newActivitySet);
            scope.$digest();
            expect(scope.taskList).toEqual([]);
          });
        });

        /**
         * Fills up with random placeholder data the contacts collection of the
         * given list
         *
         * @param {Array} list
         * @param {string} type - task or document
         */
        function fillContactsCollectionOf(list, type) {
            list.forEach(function (item, index) {
                scope.contacts[type][index] = _.range(_.random(5)).map(function () {
                    return { id: _.uniqueId() };
                })
            });
        }

        /**
         * [initController description]
         * @return {[type]} [description]
         */
        function initController() {
          ctrl = $controller('ModalAssignmentCtrl', {
            $scope: scope,
            AssignmentService: AssignmentService,
            TaskService: TaskService,
            DocumentService: DocumentService,
            ContactService: ContactService,
            data: {},
            config: {},
            settings: {
              tabEnabled: {
                documents: "1",
                keyDates: "1"
              }
            },
            HR_settings: HR_settings,
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

    describe('ModalAssignmentActivityCtrl', function () {
      var $controller, ctrl, scope;

      beforeEach(module('civitasks.appDashboard'));
      beforeEach(inject(function (_$controller_, $httpBackend, $rootScope) {
        // A workaround to avoid actual API calls
        $httpBackend.whenGET(/action=/).respond({});

        $controller = _$controller_;

        scope = $rootScope.$new();
        scope.activity = Mock.taskList[0];
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

      function initController() {
        ctrl = $controller('ModalAssignmentActivityCtrl', {
          $scope: scope,
        });
      }
    });
});
