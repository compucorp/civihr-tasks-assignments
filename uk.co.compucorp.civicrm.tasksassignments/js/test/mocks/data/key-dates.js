/* eslint-env amd */

define(function () {
  return {
    withDateContactList: function () {
      return [
        {
          'date': '2017-01-07',
          'dateContactList': [
            {
              'contact_id': '93',
              'contact_external_identifier': '',
              'contact_name': 'Díaz, Kacey',
              'keydate': '2017-01-07',
              'type': 'birth_date'
            }
          ]
        },
        {
          'date': '2017-01-11',
          'dateContactList': [
            {
              'contact_id': '178',
              'contact_external_identifier': '',
              'contact_name': 'Yadav, Esta',
              'keydate': '2017-01-11',
              'type': 'birth_date'
            }
          ]
        },
        {
          'date': '2017-11-29',
          'dateContactList': [
            {
              'contact_id': '204',
              'contact_external_identifier': '',
              'contact_name': 'civihr_staff@compucorp.co.uk',
              'keydate': '2017-11-29',
              'type': 'period_end_date'
            }
          ]
        },
        {
          'date': '2017-12-01',
          'dateContactList': [
            {
              'contact_id': '28',
              'contact_external_identifier': '',
              'contact_name': 'González, Ray',
              'keydate': '2017-12-01',
              'type': 'period_start_date'
            }
          ]
        }
      ];
    },
    withoutDateContactList: function () {
      return [
        {
          'contact_id': '93',
          'contact_external_identifier': '',
          'contact_name': 'Díaz, Kacey',
          'keydate': '2017-01-07',
          'type': 'birth_date'
        },
        {
          'contact_id': '178',
          'contact_external_identifier': '',
          'contact_name': 'Yadav, Esta',
          'keydate': '2017-01-11',
          'type': 'birth_date'
        },
        {
          'contact_id': '204',
          'contact_external_identifier': '',
          'contact_name': 'civihr_staff@compucorp.co.uk',
          'keydate': '2017-11-29',
          'type': 'period_end_date'
        },
        {
          'contact_id': '28',
          'contact_external_identifier': '',
          'contact_name': 'González, Ray',
          'keydate': '2017-12-01',
          'type': 'period_start_date'
        }
      ];
    }
  };
});
