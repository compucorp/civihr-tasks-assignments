/* eslint-env amd */

define(function () {
  return {
    single: function () {
      return {
        contact_id: '3',
        contact_type: 'Individual',
        display_name: 'Mrs. Teresa Jacobs',
        email: 'teresaj@mymail.co.nz',
        email_id: '16',
        hrjobroles_id: '',
        id: '3',
        sort_name: 'Jacobs, Teresa',
        description: []
      };
    },
    list: function () {
      return [
        {
          contact_id: '202',
          contact_type: 'Individual',
          display_name: 'Mr. John Doe',
          email: 'johndoe@mymail.co.nz',
          email_id: '16',
          hrjobroles_id: '',
          id: '3',
          sort_name: 'John, Doe',
          description: []
        },
        {
          contact_id: '203',
          contact_type: 'Individual',
          display_name: 'Mrs. Teresa Jacobs',
          email: 'teresaj@mymail.co.nz',
          email_id: '16',
          hrjobroles_id: '',
          id: '3',
          sort_name: 'Jacobs, Teresa',
          description: []
        },
        {
          contact_id: '204',
          contact_type: 'Individual',
          display_name: 'Felisha Yadav-Roberts',
          email: 'felishayadav-roberts@notmail.co.in',
          email_id: '124',
          hrjobroles_id: '',
          id: '4',
          sort_name: 'Yadav-Roberts, Felisha',
          description: []
        },
        {
          contact_id: '205',
          contact_type: 'Individual',
          display_name: 'Helina Aevan',
          email: 'helina@notmail.co.in',
          email_id: '124',
          hrjobroles_id: '',
          id: '4',
          sort_name: 'Helina, Aevan',
          description: []
        }
      ];
    }
  };
});
