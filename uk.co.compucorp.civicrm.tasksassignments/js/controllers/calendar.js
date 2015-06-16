define(['controllers/controllers',
        'moment',
        'services/task'], function(controllers, moment){
    controllers.controller('CalendarCtrl',['$scope', '$log', '$rootScope', '$filter', '$timeout', '$state', '$stateParams',
        'taskList', 'documentList', 'settings',
        function($scope, $log, $rootScope, $filter, $timeout, $state, $stateParams, taskList, documentList, settings){

            this.init = function(){
                $scope.calTaskList = this.createCalTaskList(taskList);

                if (!+settings.tabEnabled.documents) {
                    return;
                }

                $scope.calDocList = this.createCalDocList(documentList);
            };

            this.createCalDocList = function(documentList){
                var cache = $rootScope.cache, documentDue, documentExp, calDocumentList = [];

                angular.forEach(documentList, function(document){
                    documentDue = moment(document.activity_date_time).toDate();

                    this.push(
                        {
                            title: cache.documentType.obj[document.activity_type_id],
                            type: 'document',
                            startsAt: documentDue,
                            endsAt: documentDue,
                            editable: false,
                            deletable: false,
                            incrementsBadgeTotal: true
                        }
                    )

                    if (!!document.expire_date) {
                        documentExp = moment(document.expire_date).toDate();

                        this.push(
                            {
                                title: cache.documentType.obj[document.activity_type_id],
                                type: 'document',
                                startsAt: documentExp,
                                endsAt: documentExp,
                                editable: false,
                                deletable: false,
                                incrementsBadgeTotal: true
                            }
                        )
                    }

                },calDocumentList);

                return calDocumentList;
            };

            this.createCalTaskList = function(taskList){
                var cache = $rootScope.cache, taskDue, calTaskList = [];

                angular.forEach(taskList, function(task){
                    taskDue = moment(task.activity_date_time).toDate();
                    this.push(
                        {
                            title: cache.taskType.obj[task.activity_type_id],
                            type: 'task',
                            startsAt: taskDue,
                            endsAt: taskDue,
                            editable: false,
                            deletable: false,
                            incrementsBadgeTotal: true
                        }
                    )
                },calTaskList);

                return calTaskList;
            };

            $scope.calendarDay = new Date();
            $scope.calendarTitle = '';
            $scope.calendarView = $state.params.calendarView || 'month';
            $scope.calTaskList = [];
            $scope.calDocList = [];

            $scope.displayDayView = function(calendarDate) {
                $scope.calendarDay = moment(calendarDate).toDate();
                $scope.calendarView = 'day';
                $state.go('calendar.day');
            };

            this.init();

            function eventUpdateCb(output, input, calActvList, activityTypeObj) {
                var actvDueOut = moment(output.activity_date_time).toDate(),
                    actvTitleOut = activityTypeObj[output.activity_type_id],
                    isNewActv = angular.equals({}, input),
                    len = calActvList.length, i = 0;

                if (!isNewActv) {
                    var actvDueIn = moment(input.activity_date_time).toDate(),
                        actvTitleIn = activityTypeObj[input.activity_type_id];

                    for (; i < len; i++) {
                        if (calActvList[i].title == actvTitleIn &&
                            +calActvList[i].startsAt == +actvDueIn) {
                            calActvList.splice(i,1);
                            break;
                        }
                    }
                }

                calActvList.push({
                    title: actvTitleOut,
                    type: 'task',
                    startsAt: actvDueOut,
                    endsAt: actvDueOut,
                    editable: false,
                    deletable: false,
                    incrementsBadgeTotal: true
                });
            }

            $scope.$on('taskFormSuccess',function(e, output, input){
                eventUpdateCb(output, input, $scope.calTaskList, $rootScope.cache.taskType.obj)
            });

            $scope.$on('documentFormSuccess',function(e, output, input){
                eventUpdateCb(output, input, $scope.calDocList, $rootScope.cache.documentType.obj)
            });


             $scope.$on('assignmentFormSuccess',function(e, output){
                //Array.prototype.push.apply($scope.taskList, output.taskList);
             });

        }]);
});