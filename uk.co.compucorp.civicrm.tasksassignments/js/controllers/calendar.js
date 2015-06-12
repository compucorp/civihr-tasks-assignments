define(['controllers/controllers',
        'moment',
        'services/task'], function(controllers, moment){
    controllers.controller('CalendarCtrl',['$scope', '$log', '$rootScope', '$filter', '$timeout', '$state', '$stateParams',
        function($scope, $log, $rootScope, $filter, $timeout, $state, $stateParams){

            $scope.calendarDay = new Date();
            $scope.calendarTitle = '';
            $scope.calendarView = $state.params.calendarView || 'month';
            $scope.events = [
                {
                    title: 'My event title', // The title of the event
                    type: 'info', // The type of the event (determines its color). Can be important, warning, info, inverse, success or special
                    startsAt: new Date(2013,5,1,1), // A javascript date object for when the event starts
                    endsAt: new Date(2014,8,26,15), // A javascript date object for when the event ends
                    editable: false, // If edit-event-html is set and this field is explicitly set to false then dont make it editable
                    deletable: false, // If delete-event-html is set and this field is explicitly set to false then dont make it deleteable
                    incrementsBadgeTotal: true //If set to false then will not count towards the badge total amount on the month and year view
                }
            ];

            $scope.displayDayView = function(calendarDate) {
                $scope.calendarDay = calendarDate;
                $state.go('calendar.day');
            };
        }]);
});