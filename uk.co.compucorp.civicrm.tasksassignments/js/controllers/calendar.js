define(['controllers/controllers',
        'moment',
        'services/task'], function(controllers, moment){
    controllers.controller('CalendarCtrl',['$scope', '$log', '$rootScope', '$filter', '$timeout', '$state', '$stateParams',
        'taskList', 'documentList',
        function($scope, $log, $rootScope, $filter, $timeout, $state, $stateParams, taskList, documentList){

            this.init = function(){
                $scope.calTaskList = this.createCalTaskList(taskList);
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
            $scope.calendarView = $stateParams.calendarView || 'month';
            $scope.calTaskList = [];
            $scope.calDocList = [];

            this.init();

            $scope.displayDayView = function(calendarDate) {
                $scope.calendarDay = moment(calendarDate).toDate();
                $scope.calendarView = 'day';
                $state.go('calendar.day');
            };
        }]);
});