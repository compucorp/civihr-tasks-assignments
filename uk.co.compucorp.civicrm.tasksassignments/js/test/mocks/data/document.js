/* eslint-env amd */

define([
  'mocks/fabricators/document'
], function (documentFabricator) {
  return {
    onAssign: {
      is_error: 0,
      values: documentFabricator.list()
    },
    onSave: {
      is_error: 0,
      values: [documentFabricator.single()]
    },
    onSaveMultiple: {
      is_error: 0,
      values: documentFabricator.list()
    },
    onSendReminder: {
      is_error: 0,
      values: true
    },
    onGetOptions: {
      documentTypes: {
        'is_error': 0,
        'version': 3,
        'count': 5,
        'values': documentFabricator.documentTypes()
      },
      documentStatus: {
        'is_error': 0,
        'version': 3,
        'count': 7,
        'values': documentFabricator.documentStatus()
      }
    }
  };
});
