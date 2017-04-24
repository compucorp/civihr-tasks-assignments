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
    reminderNote: function() {
      return "<p>Sample reminder note</p>";
    }
  }
});
