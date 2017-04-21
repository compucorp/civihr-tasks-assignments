define(function() {
  return {
    task: {
      activity_date_time: "2017-04-21",
      assignee_contact_id: ["6"],
      source_contact_id: "205",
      target_contact_id: ["10"],
      details: "<p>Detailed description of the task</p>",
      case_id: null,
      activity_type_id: "88",
      subject: "Sample Task Subject"
    },
    urlEncodedData: {
      onSave: "debug=true&json=%7B%22activity_date_time%22:%222017-04-21%22,%22assignee_contact_id%22:%5B%226%22%5D,%22source_contact_id%22:%22205%22,%22target_contact_id%22:%5B%2210%22%5D,%22details%22:%22%3Cp%3EDetailed+description+of+the+task%3C%2Fp%3E%22,%22case_id%22:null,%22activity_type_id%22:%2288%22,%22subject%22:%22Sample+Task+Subject%22%7D&sequential=1",
      onAssign: "debug=true&json=%7B%22id%22:%5B%7B%22activity_type_id%22:%2283%22,%22assignee_contact_id%22:%5B%2292%22%5D,%22case_id%22:%22161%22,%22create%22:true,%22isAdded%22:false,%22name%22:%22Schedule+Exit+Interview%22,%22source_contact_id%22:%22205%22,%22status_id%22:%221%22,%22offset%22:%22-10%22,%22activity_date_time%22:%222017-04-11%22,%22target_contact_id%22:%5B%2284%22%5D%7D,%7B%22activity_type_id%22:%2284%22,%22assignee_contact_id%22:%5B%2214%22%5D,%22case_id%22:%22161%22,%22create%22:true,%22isAdded%22:false,%22name%22:%22Get+%5C%22No+Dues%5C%22+certification%22,%22source_contact_id%22:%22205%22,%22status_id%22:%221%22,%22offset%22:%22-7%22,%22activity_date_time%22:%222017-04-14%22,%22target_contact_id%22:%5B%2284%22%5D%7D,%7B%22activity_type_id%22:%2285%22,%22assignee_contact_id%22:%5B%5D,%22case_id%22:%22161%22,%22create%22:true,%22isAdded%22:false,%22name%22:%22Conduct+Exit+Interview%22,%22source_contact_id%22:%22205%22,%22status_id%22:%221%22,%22offset%22:%22-3%22,%22activity_date_time%22:%222017-04-18%22,%22target_contact_id%22:%5B%2284%22%5D%7D%5D,%22case_id%22:1%7D&sequential=1",
      onSaveMultiple:  "debug=true&json=%7B%22task%22:%5B%7B%22activity_type_id%22:%2283%22,%22assignee_contact_id%22:%5B%2292%22%5D,%22case_id%22:%22161%22,%22create%22:true,%22isAdded%22:false,%22name%22:%22Schedule+Exit+Interview%22,%22source_contact_id%22:%22205%22,%22status_id%22:%221%22,%22offset%22:%22-10%22,%22activity_date_time%22:%222017-04-11%22,%22target_contact_id%22:%5B%2284%22%5D%7D,%7B%22activity_type_id%22:%2284%22,%22assignee_contact_id%22:%5B%2214%22%5D,%22case_id%22:%22161%22,%22create%22:true,%22isAdded%22:false,%22name%22:%22Get+%5C%22No+Dues%5C%22+certification%22,%22source_contact_id%22:%22205%22,%22status_id%22:%221%22,%22offset%22:%22-7%22,%22activity_date_time%22:%222017-04-14%22,%22target_contact_id%22:%5B%2284%22%5D%7D,%7B%22activity_type_id%22:%2285%22,%22assignee_contact_id%22:%5B%5D,%22case_id%22:%22161%22,%22create%22:true,%22isAdded%22:false,%22name%22:%22Conduct+Exit+Interview%22,%22source_contact_id%22:%22205%22,%22status_id%22:%221%22,%22offset%22:%22-3%22,%22activity_date_time%22:%222017-04-18%22,%22target_contact_id%22:%5B%2284%22%5D%7D%5D%7D&sequential=1",
      onSendReminder: "debug=true&json=%7B%22notes%22:%22%3Cp%3ESample+reminder+note%3C%2Fp%3E%22%7D&sequential=1"
    },
    taskList: [
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
    ],
    reminderNote: "<p>Sample reminder note</p>",
    response: {
      onAssign: {
        is_error: 0,
        values: [
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
      onSave: {
        is_error: 0,
        values: [
          {
            activity_date_time: "2017-04-21",
            assignee_contact_id: ["6"],
            source_contact_id: "205",
            target_contact_id: ["10"],
            details: "<p>Detailed description of the task</p>",
            case_id: null,
            activity_type_id: "88",
            subject: "Sample Task Subject"
          }
        ]
      },
      onSaveMultiple: {
        is_error: 0,
        values: [
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
      onSendReminder: {
        is_error: 0,
        values: true
      }
    }
  }
});
