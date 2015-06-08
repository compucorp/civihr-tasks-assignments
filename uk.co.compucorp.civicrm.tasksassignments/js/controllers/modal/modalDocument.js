define(['controllers/controllers',
        'services/contact',
        'services/file',
        'services/dialog',
        'services/document'], function(controllers){

    controllers.controller('ModalDocumentCtrl',['$scope', '$modalInstance', '$rootScope', '$q', '$log', '$filter',
        '$dialog', 'AssignmentService', 'DocumentService', 'ContactService', 'FileService', 'data', 'files', 'config',
        function($scope, $modalInstance, $rootScope, $q, $log, $filter, $dialog, AssignmentService, DocumentService,
                 ContactService, FileService, data, files, config){
            $log.debug('Controller: ModalDocumentCtrl');

            $scope.data = data;
            $scope.files = files;
            $scope.document = {};

            angular.copy(data,$scope.document);

            $scope.document.assignee_contact_id = $scope.document.assignee_contact_id || [];
            $scope.document.source_contact_id = $scope.document.source_contact_id || config.LOGGED_IN_CONTACT_ID;
            $scope.document.target_contact_id = $scope.document.target_contact_id || [config.CONTACT_ID];
            $scope.contacts = $rootScope.cache.contact.arrSearch;
            $scope.uploader = FileService.uploader('civicrm_activity');
            $scope.showCId = !config.CONTACT_ID;
            $scope.assignments = $filter('filter')($rootScope.cache.assignment.arrSearch, function(val){
                return +val.extra.contact_id == +$scope.document.target_contact_id;
            });

            $scope.cacheAssignment = function($item){

                if ($rootScope.cache.assignment.obj[$item.id]) {
                    return
                }

                var obj = {};

                obj[$item.id] = {
                    case_type_id: $filter('filter')($rootScope.cache.assignmentType.arr, { title: $item.extra.case_type })[0].id,
                    client_id: {
                        '1': $item.extra.contact_id
                    },
                    contact_id: {
                        '1': $item.extra.contact_id
                    },
                    contacts: [
                        {
                            sort_name: $item.extra.sort_name,
                            contact_id: $item.extra.contact_id
                        }
                    ],
                    end_date: $item.extra.end_date,
                    id: $item.id,
                    is_deleted: $item.label_class == 'strikethrough' ? '1' : '0',
                    start_date: $item.extra.start_date,
                    subject: $item.extra.case_subject
                };

                AssignmentService.updateCache(obj);
            };

            $scope.cacheContact = function($item){
                var obj = {};

                obj[$item.id] = {
                    contact_id: $item.id,
                    contact_type: $item.icon_class,
                    sort_name: $item.label,
                    email: $item.description.length ? $item.description[0] : ''
                };

                ContactService.updateCache(obj);
            };

            $scope.refreshAssignments = function(input){

                if (!input) {
                    return
                }

                var targetContactId = $scope.document.target_contact_id;

                AssignmentService.search(input, $scope.document.case_id).then(function(results){
                    $scope.assignments = $filter('filter')(results, function(val){
                        return +val.extra.contact_id == +targetContactId;
                    });
                });
            };

            $scope.refreshContacts = function(input){
                if (!input) {
                    return
                }

                ContactService.search(input, {
                    contact_type: 'Individual'
                }).then(function(results){
                    $scope.contacts = results;
                });
            };

            $scope.dpOpened = {
                due: false,
                exp: false
            };

            $scope.cancel = function(){

                if ($scope.documentForm.$pristine) {
                    $modalInstance.dismiss('cancel');
                    return
                }

                $dialog.open({
                    copyCancel: 'No',
                    msg: 'Are you sure you want to cancel? Changes will be lost!'
                }).then(function(confirm){
                    if (!confirm) {
                        return
                    }

                    $scope.$broadcast('ct-spinner-hide');
                    $modalInstance.dismiss('cancel');
                });

            };

            $scope.confirm = function(){

                if (angular.equals(data,$scope.document) &&
                    angular.equals(files,$scope.files) &&
                    !$scope.uploader.queue.length) {
                    $modalInstance.dismiss('cancel');
                    return
                }

                $scope.$broadcast('ct-spinner-show');

                $scope.document.activity_date_time = $scope.document.activity_date_time || new Date();

                DocumentService.save($scope.document).then(function(resultDocument){

                    if ($scope.uploader.queue.length) {
                        FileService.upload($scope.uploader, resultDocument.id).then(function(resultFileUpload){
                            AssignmentService.updateTab();
                            $modalInstance.close(angular.extend(resultDocument,$scope.document));
                            $scope.$broadcast('ta-spinner-hide');
                        },function(reason){
                            CRM.alert(reason, 'Error', 'error');
                            $modalInstance.dismiss();
                            $scope.$broadcast('ta-spinner-hide');
                            return $q.reject();
                        });
                    }

                    AssignmentService.updateTab();
                    $modalInstance.close(angular.extend(resultDocument,$scope.document));
                    $scope.$broadcast('ta-spinner-hide');

                },function(reason){
                    CRM.alert(reason, 'Error', 'error');
                    $modalInstance.dismiss();
                    $scope.$broadcast('ta-spinner-hide');
                    return $q.reject();
                });

            }

        }]);
});