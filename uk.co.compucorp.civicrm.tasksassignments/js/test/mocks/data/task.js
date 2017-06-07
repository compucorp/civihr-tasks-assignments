define([
  'mocks/fabricators/task'
], function(taskFabricator) {
  return {
    onAssign: {
      is_error: 0,
      values: taskFabricator.list()
    },
    onSave: {
      is_error: 0,
      values: [taskFabricator.single()]
    },
    onSaveMultiple: {
      is_error: 0,
      values: taskFabricator.list()
    },
    onSendReminder: {
      is_error: 0,
      values: true
    },
    onGetOptions: {
      activityTypes: {
        "is_error": 0,
        "version": 3,
        "count": 5,
        "values": taskFabricator.activityTypes()
      },
      taskStatus: {
        "is_error": 0,
        "version": 3,
        "count": 5,
        "values": taskFabricator.taskStatus()
      }
    }
  }
});
