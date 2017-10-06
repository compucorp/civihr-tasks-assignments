/* eslint-env amd */

define(function () {
  return {
    single: function () {
      return {
        id: '1216',
        activity_date_time: '2017-06-09T18:15:00.000Z',
        activity_type_id: '66',
        status_id: '3',
        assignee_contact_id: ['203'],
        source_contact_id: '205',
        target_contact_id: ['203'],
        custom_83_55: '2017-06-02 00:00:00',
        custom_100013_55: '2017-05-30 00:00:00',
        custom_100014_55: '1',
        custom_100015_55: '999999922',
        case_id: '',
        file_count: '2',
        expire_date: '2017-06-01T18:15:00.000Z',
        valid_from: '2017-05-29T18:15:00.000Z',
        remind_me: true,
        document_number: '999999922',
        due: false
      };
    },
    list: function () {
      return [
        {
          id: '1200',
          activity_date_time: '2017-05-03 00:00:00',
          activity_type_id: '67',
          status_id: '4',
          assignee_contact_id: ['202', '204'],
          source_contact_id: '204',
          target_contact_id: ['205'],
          custom_83_32: '2017-05-11 00:00:00',
          custom_100013_32: '2017-04-30 00:00:00',
          custom_100014_32: '1',
          custom_100015_32: '3423424',
          case_id: '5',
          file_count: '1',
          expire_date: '2017-05-11',
          valid_from: '2017-04-30',
          remind_me: '1',
          document_number: '3423424'
        },
        {
          id: '1205',
          activity_date_time: '2017-05-16 00:00:00',
          activity_type_id: '68',
          status_id: '2',
          assignee_contact_id: ['204'],
          source_contact_id: '205',
          target_contact_id: ['204'],
          custom_83_37: '2017-05-19 00:00:00',
          custom_100013_37: '2017-05-15 00:00:00',
          custom_100014_37: '0',
          custom_100015_37: 'asdfasdf',
          case_id: '9',
          file_count: '1',
          expire_date: '2017-05-19',
          valid_from: '2017-05-15',
          remind_me: '0',
          document_number: 'asdfasdf'
        },
        {
          id: '1209',
          activity_date_time: '2017-05-29 00:00:00',
          activity_type_id: '69',
          details: '\n',
          status_id: '2',
          assignee_contact_id: ['202'],
          source_contact_id: '205',
          target_contact_id: ['202'],
          custom_83_39: '2017-05-31 00:00:00',
          custom_100014_39: '0',
          case_id: '10',
          file_count: '1',
          expire_date: '2017-05-31',
          remind_me: '0'
        },
        {
          id: '1210',
          activity_date_time: '2017-05-16 00:00:00',
          activity_type_id: '70',
          status_id: '3',
          assignee_contact_id: ['203'],
          source_contact_id: '205',
          target_contact_id: ['203'],
          custom_83_40: '2017-06-09 00:00:00',
          custom_100013_40: '2017-05-27 00:00:00',
          custom_100014_40: '1',
          custom_100015_40: '1234124',
          case_id: '',
          file_count: '1',
          expire_date: '2017-06-09',
          valid_from: '2017-05-27',
          remind_me: '1',
          document_number: '1234124'
        },
        {
          id: '1213',
          activity_date_time: '2017-06-21 00:00:00',
          activity_type_id: '71',
          status_id: '2',
          assignee_contact_id: ['204'],
          source_contact_id: '205',
          target_contact_id: ['203'],
          custom_83_43: '2017-06-10 00:00:00',
          custom_100013_43: '2017-05-11 00:00:00',
          custom_100014_43: '1',
          custom_100015_43: '123121123412',
          case_id: '5',
          file_count: '1',
          expire_date: '2017-06-10',
          valid_from: '2017-05-11',
          remind_me: '1',
          document_number: '123121123412'
        }
      ];
    },
    documentTypes: function () {
      return [
        {
          key: '66',
          value: 'VISA'
        },
        {
          key: '67',
          value: 'Passport'
        },
        {
          key: '68',
          value: 'Government Photo ID'
        },
        {
          key: '69',
          value: 'Driving licence'
        },
        {
          key: '70',
          value: 'Identity card'
        },
        {
          key: '71',
          value: 'Certificate of sponsorship (COS)'
        },
        {
          key: '121',
          value: 'P45'
        }
      ];
    },
    documentStatus: function () {
      return [
        {
          key: '1',
          value: 'awaiting upload'
        },
        {
          key: '2',
          value: 'awaiting approval'
        },
        {
          key: '3',
          value: 'approved'
        },
        {
          key: '4',
          value: 'rejected'
        }
      ];
    },
    reminderNote: function () {
      return '<p>Sample reminder note</p>';
    }
  };
});
