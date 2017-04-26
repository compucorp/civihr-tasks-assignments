define(function() {
  return {
    single: function() {
      return {
        activity_date_time: "2017-04-21",
        assignee_contact_id: ["6"],
        source_contact_id: "205",
        target_contact_id: ["10"],
        details: "<p>Detailed description of the task</p>",
        case_id: null,
        activity_type_id: "88",
        subject: "Sample Task Subject"
      };
    },
    list: function() {
      return [
        {
          "activity_type_id": "83",
          "assignee_contact_id": [
            "92"
          ],
          "case_id": "161",
          "create": true,
          "isAdded": false,
          "name": "Schedule Exit Interview",
          "source_contact_id": "205",
          "status_id": "1",
          "offset": "-10",
          "activity_date_time": "2017-04-11",
          "target_contact_id": [
            "84"
          ]
        },
        {
          "activity_type_id": "84",
          "assignee_contact_id": [
            "14"
          ],
          "case_id": "161",
          "create": true,
          "isAdded": false,
          "name": "Get \"No Dues\" certification",
          "source_contact_id": "205",
          "status_id": "1",
          "offset": "-7",
          "activity_date_time": "2017-04-14",
          "target_contact_id": [
            "84"
          ]
        },
        {
          "activity_type_id": "85",
          "assignee_contact_id": [],
          "case_id": "161",
          "create": true,
          "isAdded": false,
          "name": "Conduct Exit Interview",
          "source_contact_id": "205",
          "status_id": "1",
          "offset": "-3",
          "activity_date_time": "2017-04-18",
          "target_contact_id": [
            "84"
          ]
        }
      ]
    },
    activityTypes: function() {
      return [
        {
          "key": "13",
          "value": "Open Case"
        },
        {
          "key": "83",
          "value": "Schedule Exit Interview"
        },
        {
          "key": "84",
          "value": "Get \"No Dues\" certification"
        },
        {
          "key": "85",
          "value": "Conduct Exit Interview"
        },
        {
          "key": "86",
          "value": "Revoke Access to Database"
        }
      ]
    },
    taskStatus: function() {
      return [
        {
          "key": 1,
          "value": "Scheduled"
        },
        {
          "key": 2,
          "value": "Completed"
        },
        {
          "key": 3,
          "value": "Cancelled"
        },
        {
          "key": 4,
          "value": "Left Message"
        },
        {
          "key": 5,
          "value": "Unreachable"
        }
      ]
    },
    reminderNote: function() {
      return "<p>Sample reminder note</p>";
    }
  }
});
