+define(['services/services',
        'services/utils'], function (services) {

    services.factory('Document',['$resource', 'config', '$log', function($resource, config, $log){
        $log.debug('Service: Document');

        return $resource(config.url.REST,{
            'action': 'get',
            'entity': 'Document',
            'json': {}
        });

    }]);

    services.factory('DocumentService',['Document', '$q', 'config', 'UtilsService', '$log',
        function(Document, $q, config, UtilsService, $log){
        $log.debug('Service: DocumentService');

        return {
            assign: function(documentArr, assignmentId){

                if ((!documentArr || !angular.isArray(documentArr)) ||
                    (!assignmentId || typeof +assignmentId !== 'number')) {
                    return null;
                }

                var deferred = $q.defer();

                Document.save({
                    action: 'copy_to_assignment',
                    json: {
                        sequential: 1,
                        debug: config.DEBUG,
                        id: documentArr,
                        case_id: assignmentId
                    }
                }, null, function(data){

                    if (UtilsService.errorHandler(data,'Unable to assign documents',deferred)) {
                        return
                    }

                    deferred.resolve(data.values);
                },function(){
                    deferred.reject('Unable to assign documents');
                });

                return deferred.promise;
            },
            get: function(params){
                var deferred = $q.defer();

                params = params && typeof params === 'object' ? params : {};

                params = angular.extend({
                    'component': 'CiviDocument',
                    'is_current_revision': '1',
                    'is_deleted': '0',
                    'sequential': '1',
                    'return': 'activity_date_time, activity_type_id, assignee_contact_id, details, id, source_contact_id, target_contact_id, subject, status_id'
                },params);

                Document.get({json: params}, function(data){
                    deferred.resolve(data.values);
                },function(){
                    deferred.reject('Unable to fetch documents list');
                });

                return deferred.promise;
            },
            getOptions: function(){
                var deferred = $q.defer(),
                    deferredDocumentType = $q.defer(),
                    deferredDocumentStatus = $q.defer(),
                    documentType = {
                        arr: [],
                        obj: {}
                    },
                    documentStatus = {
                        arr: [],
                        obj: {}
                    }

                Document.get({
                    action: 'getoptions',
                    json: {
                        'field': 'activity_type_id'
                    }
                }, function(data){
                    var optionId;

                    for (optionId in data.values) {
                        documentType.arr.push({
                            key: optionId,
                            value: data.values[optionId]
                        })
                    }

                    documentType.obj = data.values;

                    deferredDocumentType.resolve(documentType);
                });

                Document.get({
                    action: 'getoptions',
                    json: {
                        'field': 'status_id'
                    }
                }, function(data){
                    var optionId;

                    for (optionId in data.values) {
                        documentStatus.arr.push({
                            key: optionId,
                            value: data.values[optionId]
                        })
                    }

                    documentStatus.obj = data.values;

                    deferredDocumentStatus.resolve(documentStatus);
                });

                $q.all({
                    documentType: deferredDocumentType.promise,
                    documentStatus: deferredDocumentStatus.promise
                }).then(function(options){
                    deferred.resolve(options);
                });

                return deferred.promise;
            },
            save: function(document){

                if (!document || typeof document !== 'object') {
                    return null;
                }

                var deferred = $q.defer(),
                    params = angular.extend({
                        sequential: 1,
                        debug: config.DEBUG
                    },document),
                    val;

                Document.save({
                    action: 'create',
                    json: params
                }, null, function(data){

                    if (UtilsService.errorHandler(data,'Unable to save document',deferred)) {
                        return
                    }

                    val = data.values;
                    deferred.resolve(val.length == 1 ? val[0] : null);
                },function(){
                    deferred.reject('Unable to save document');
                });

                return deferred.promise;
            },
            saveMultiple: function(documentArr){

                if (!documentArr || !angular.isArray(documentArr)) {
                    return null;
                }

                var deferred = $q.defer();

                Document.save({
                    action: 'create_multiple',
                    json: {
                        sequential: 1,
                        debug: config.DEBUG,
                        document: documentArr
                    }
                }, null, function(data){

                    if (UtilsService.errorHandler(data,'Unable to save documents',deferred)) {
                        return
                    }

                    deferred.resolve(data.values);
                },function(){
                    deferred.reject('Unable to save documents');
                });

                return deferred.promise;
            },
            sendReminder: function(documentId, notes){

                if (!documentId || typeof +documentId !== 'number') {
                    return null;
                }

                var deferred = $q.defer();

                Document.save({
                    action: 'sendreminder',
                    json: {
                        sequential: 1,
                        debug: config.DEBUG,
                        activity_id: documentId,
                        notes: notes || ''
                    }
                }, null, function(data){

                    if (UtilsService.errorHandler(data,'Unable to send a reminder',deferred)) {
                        return
                    }

                    deferred.resolve(data);
                },function(){
                    deferred.reject('Unable to send a reminder');
                });

                return deferred.promise;
            },
            delete: function(documentId) {

                if (!documentId || typeof +documentId !== 'number') {
                    return null;
                }

                var deferred = $q.defer();

                Document.delete({
                    action: 'delete',
                    json: { id: documentId }
                }, function(data){
                    deferred.resolve(data);
                },function(){
                    deferred.reject('Could not delete document ID: '+documentId);
                });

                return deferred.promise;
            }
        }

    }]);

});