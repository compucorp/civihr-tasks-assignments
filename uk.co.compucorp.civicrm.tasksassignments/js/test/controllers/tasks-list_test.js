define([
    'common/angularMocks',
    'tasks-assignments/app'
], function () {
    'use strict';

    describe('TaskListCtrl', function () {
        var $scope, ContactService;

        beforeEach(module('civitasks.appDashboard'));
        beforeEach(inject(function ($controller, $rootScope, _ContactService_) {
            $scope = $rootScope.$new();
            ContactService = _ContactService_;

            $controller('TaskListCtrl', {
                $scope: $scope,
                taskList: []
            });
        }));

        describe('cacheContact()', function () {
            var contactToCacheId = '3';

            beforeEach(function () {
                spyOn(ContactService, 'updateCache');
                $scope.contacts = mockedTempCachedContacts();

                $scope.cacheContact(contactToCacheId);
            });

            it('calls the ContactService', function () {
                expect(ContactService.updateCache).toHaveBeenCalled();
            });

            it('passes to the cache the expected object', function () {
                expect(ContactService.updateCache).toHaveBeenCalledWith({
                    '3': {
                        contact_id: '3',
                        contact_type: 'type 1',
                        sort_name: 'temp3',
                        display_name: 'temp3',
                        email: 'temp3@example.org'
                    }
                });
            });
        });

        function mockedTempCachedContacts() {
            return [
                {
                    id: '1',
                    icon_class: 'type 1',
                    label: 'temp1',
                    description: ['temp1@example.org']
                },
                {
                    id: '2',
                    icon_class: 'type 2',
                    label: 'temp2',
                    description: ['temp2@example.org']
                },
                {
                    id: '3',
                    icon_class: 'type 1',
                    label: 'temp3',
                    description: ['temp3@example.org']
                }
            ];
        }
    });
});
