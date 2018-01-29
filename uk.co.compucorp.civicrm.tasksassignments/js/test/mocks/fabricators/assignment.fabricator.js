/* eslint-env amd */

define(function () {
  return {
    listResponse: function () {
      return [
        {
          id: '3',
          label: 'civihr_staff@compucorp.co.uk - Exiting',
          label_class: '',
          description: ['Exiting(Ongoing)'],
          extra: {
            sort_name: 'civihr_staff@compucorp.co.uk',
            case_type: 'Exiting',
            contact_id: '204',
            start_date: '2017-06-22',
            end_date: null,
            case_subject: 'Exiting',
            case_status: 'Ongoing'
          }
        },
        {
          id: '1',
          label: 'civihr_staff@compucorp.co.uk - Application',
          label_class: '',
          description: ['Application(Ongoing)'],
          extra: {
            sort_name: 'civihr_staff@compucorp.co.uk',
            case_type: 'Application',
            contact_id: '204',
            start_date: '2017-06-22',
            end_date: null,
            case_subject: 'Application',
            case_status: 'Ongoing'
          }
        }
      ];
    },
    assignmentTypes: function () {
      return {
        '3': {
          'id': '3',
          'name': 'Exiting',
          'title': 'Exiting',
          'is_active': '1',
          'weight': '1',
          'definition': {
            'activityTypes': [
              {
                'name': 'Schedule Exit Interview'
              },
              {
                'name': 'Get \'No Dues\' certification'
              },
              {
                'name': 'Conduct Exit Interview'
              },
              {
                'name': 'Revoke Access to Database'
              },
              {
                'name': 'Block work email ID'
              },
              {
                'name': 'Background Check'
              },
              {
                'name': 'References Check'
              }
            ],
            'activitySets': [
              {
                'name': 'standard_timeline',
                'label': 'Standard Timeline',
                'timeline': '1',
                'activityTypes': [
                  {
                    'name': 'Schedule Exit Interview',
                    'reference_offset': '-10',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'Get \'No Dues\' certification',
                    'reference_offset': '-7',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'Conduct Exit Interview',
                    'reference_offset': '-3',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'Revoke Access to Database',
                    'reference_offset': '0',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'Block work email ID',
                    'reference_offset': '0',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  }
                ]
              }
            ],
            'caseRoles': [
              {
                'name': 'HR Manager',
                'creator': '1',
                'manager': '1'
              }
            ]
          },
          'is_forkable': '1',
          'is_forked': '',
          '$$hashKey': 'object:23'
        },
        '4': {
          'id': '4',
          'name': 'Joining',
          'title': 'Joining',
          'is_active': '1',
          'weight': '2',
          'definition': {
            'activityTypes': [
              {
                'name': 'Schedule joining date'
              },
              {
                'name': 'Issue appointment letter'
              },
              {
                'name': 'Fill Employee Details Form'
              },
              {
                'name': 'Submission of ID/Residence proofs and photos'
              },
              {
                'name': 'Program and work induction by program supervisor'
              },
              {
                'name': 'Enter employee data in CiviHR'
              },
              {
                'name': 'Group Orientation to organization, values, policies'
              },
              {
                'name': 'Probation appraisal (start probation workflow)'
              },
              {
                'name': 'Background Check'
              },
              {
                'name': 'References Check'
              },
              {
                'name': 'Confirm End of Probation Date'
              },
              {
                'name': 'Start Probation workflow'
              }
            ],
            'activitySets': [
              {
                'name': 'standard_timeline',
                'label': 'Standard Timeline',
                'timeline': '1',
                'activityTypes': [
                  {
                    'name': 'Schedule joining date',
                    'reference_offset': '-10',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'Issue appointment letter',
                    'reference_offset': '-10',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'Fill Employee Details Form',
                    'reference_offset': '-10',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'Submission of ID/Residence proofs and photos',
                    'reference_offset': '-10',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'Enter employee data in CiviHR',
                    'reference_offset': '-7',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'Program and work induction by program supervisor',
                    'reference_offset': '-10',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'Group Orientation to organization, values, policies',
                    'reference_offset': '7',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'Confirm End of Probation Date',
                    'reference_offset': '30',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'Start Probation workflow',
                    'reference_offset': '30',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'P45',
                    'reference_offset': '-10',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'Passport',
                    'reference_offset': '-10',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  }
                ]
              },
              {
                'name': 'non_eea_timeline',
                'label': 'Non EEA Staff Member Timeline',
                'timeline': '1',
                'activityTypes': [
                  {
                    'name': 'Schedule joining date',
                    'reference_offset': '-10',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'Issue appointment letter',
                    'reference_offset': '-10',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'Fill Employee Details Form',
                    'reference_offset': '-10',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'Submission of ID/Residence proofs and photos',
                    'reference_offset': '-10',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'Enter employee data in CiviHR',
                    'reference_offset': '-7',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'Program and work induction by program supervisor',
                    'reference_offset': '-10',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'Group Orientation to organization, values, policies',
                    'reference_offset': '7',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'Confirm End of Probation Date',
                    'reference_offset': '30',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'Start Probation workflow',
                    'reference_offset': '30',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'P45',
                    'reference_offset': '-10',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'Passport',
                    'reference_offset': '-10',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'VISA',
                    'reference_offset': '-10',
                    'reference_activity': 'Open Case',
                    'status': 'Scheduled',
                    'reference_select': 'newest'
                  }
                ]
              }
            ],
            'caseRoles': [
              {
                'name': 'HR Manager',
                'creator': '1',
                'manager': '1'
              },
              {
                'name': 'Recruiting Manager',
                'creator': '1',
                'manager': '1'
              }
            ]
          },
          'is_forkable': '1',
          'is_forked': '',
          '$$hashKey': 'object:24'
        },
        '5': {
          'id': '5',
          'name': 'Application',
          'title': 'Application',
          'description': 'Application',
          'is_active': '1',
          'is_reserved': '1',
          'weight': '7',
          'definition': {
            'activityTypes': [
              {
                'name': 'Open Case',
                'max_instances': '1'
              },
              {
                'name': 'Follow up'
              },
              {
                'name': 'Change Case Status'
              },
              {
                'name': 'Assign Case Role'
              },
              {
                'name': 'Link Cases'
              },
              {
                'name': 'Email'
              },
              {
                'name': 'Meeting'
              },
              {
                'name': 'Phone Call'
              },
              {
                'name': 'Comment'
              }
            ],
            'activitySets': [
              {
                'name': 'standard_timeline',
                'label': 'Standard Timeline',
                'timeline': '1',
                'activityTypes': [
                  {
                    'name': 'Open Case',
                    'status': 'Completed'
                  },
                  {
                    'name': 'Phone Call',
                    'reference_offset': '1',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'Email',
                    'reference_offset': '2',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'Meeting',
                    'reference_offset': '3',
                    'reference_select': 'newest'
                  },
                  {
                    'name': 'Follow up',
                    'reference_offset': '7',
                    'reference_select': 'newest'
                  }
                ]
              }
            ],
            'caseRoles': [
              {
                'name': 'Recruiting Manager',
                'manager': '1',
                'creator': '1'
              }
            ]
          },
          'is_forkable': '1',
          'is_forked': '',
          '$$hashKey': 'object:25'
        }
      };
    },
    listAssignments: function () {
      return {
        '5': {
          'id': '5',
          'case_type_id': '3',
          'is_deleted': '0',
          'start_date': '2017-08-17',
          'status_id': '1',
          'subject': 'Exiting',
          'contact_id': {
            '1': '204'
          },
          'client_id': {
            '1': '204'
          },
          'contacts': [
            {
              'contact_id': '204',
              'sort_name': 'civihr_staff@compucorp.co.uk',
              'display_name': 'civihr_staff@compucorp.co.uk',
              'email': 'civihr_staff@compucorp.co.uk',
              'phone': '',
              'birth_date': '',
              'role': 'Contact'
            },
            {
              'contact_id': '206',
              'display_name': 'civihr_admin@compucorp.co.uk',
              'sort_name': 'civihr_admin@compucorp.co.uk',
              'relationship_type_id': '9',
              'role': 'Case Coordinator',
              'email': 'civihr_admin@compucorp.co.uk',
              'phone': ''
            }
          ]
        },
        '9': {
          'id': '9',
          'case_type_id': '5',
          'is_deleted': '0',
          'start_date': '2017-08-23',
          'status_id': '1',
          'subject': 'Application',
          'contact_id': {
            '1': '204'
          },
          'client_id': {
            '1': '204'
          },
          'contacts': [
            {
              'contact_id': '204',
              'sort_name': 'civihr_staff@compucorp.co.uk',
              'display_name': 'civihr_staff@compucorp.co.uk',
              'email': 'civihr_staff@compucorp.co.uk',
              'phone': '',
              'birth_date': '',
              'role': 'Contact'
            },
            {
              'contact_id': '206',
              'display_name': 'civihr_admin@compucorp.co.uk',
              'sort_name': 'civihr_admin@compucorp.co.uk',
              'relationship_type_id': '9',
              'role': 'Case Coordinator',
              'email': 'civihr_admin@compucorp.co.uk',
              'phone': ''
            }
          ]
        },
        '10': {
          'id': '45',
          'case_type_id': '5',
          'is_deleted': '0',
          'start_date': '2017-08-23',
          'status_id': '1',
          'subject': 'Application',
          'contact_id': {
            '1': '204'
          },
          'client_id': {
            '1': '204'
          },
          'contacts': [
            {
              'contact_id': '206',
              'display_name': 'civihr_admin@compucorp.co.uk',
              'sort_name': 'civihr_admin@compucorp.co.uk',
              'relationship_type_id': '9',
              'role': 'Case Coordinator',
              'email': 'civihr_admin@compucorp.co.uk',
              'phone': ''
            }
          ]
        }
      };
    }
  };
});
