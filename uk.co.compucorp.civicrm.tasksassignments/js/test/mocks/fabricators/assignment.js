define(function() {
  return {
    listResponse: function() {
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
      ]
    }
  }
});
