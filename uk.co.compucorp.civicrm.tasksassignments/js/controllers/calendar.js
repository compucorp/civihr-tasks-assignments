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
                var cache = $rootScope.cache, calDocumentList = [];

                angular.forEach(documentList, function(document){
                    document.activity_date_time = moment(document.activity_date_time).toDate();

                    this.push(
                        {
                            title: cache.documentType.obj[document.activity_type_id],
                            type: 'document',
                            startsAt: document.activity_date_time,
                            endsAt: document.activity_date_time,
                            editable: false,
                            deletable: false,
                            incrementsBadgeTotal: true
                        }
                    )

                    if (!!document.expire_date) {
                        document.expire_date = moment(document.expire_date).toDate();

                        this.push(
                            {
                                title: cache.documentType.obj[document.activity_type_id],
                                type: 'document',
                                startsAt: document.expire_date,
                                endsAt: document.expire_date,
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
                var cache = $rootScope.cache, calTaskList = [];

                angular.forEach(taskList, function(task){
                    task.activity_date_time = moment(task.activity_date_time).toDate();
                    this.push(
                        {
                            title: cache.taskType.obj[task.activity_type_id],
                            type: 'task',
                            startsAt: task.activity_date_time,
                            endsAt: task.activity_date_time,
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
            };

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
                Array.prototype.push.apply($scope.calTaskList, this.createCalTaskList(output.taskList));

                console.log($state);

                if (!+settings.tabEnabled.documents) {
                    return;
                }

                Array.prototype.push.apply($scope.calDocList, this.createCalDocList(output.documentList));
            }.bind(this));

            this.init();

        }]);
});