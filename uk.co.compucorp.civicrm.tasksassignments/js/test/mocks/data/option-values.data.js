/* eslint-env amd */

define(function () {
  return {
    getDefaultAssigneeTypes: function () {
      return {
        'is_error': 0,
        'version': 3,
        'count': 4,
        'values': [
          {
            'id': '1164',
            'option_group_id': '152',
            'label': 'None',
            'value': '1',
            'name': 'NONE',
            'filter': '0',
            'is_default': '0',
            'weight': '1',
            'is_optgroup': '0',
            'is_reserved': '0',
            'is_active': '1'
          },
          {
            'id': '1165',
            'option_group_id': '152',
            'label': 'By relationship to case client',
            'value': '2',
            'name': 'BY_RELATIONSHIP',
            'filter': '0',
            'is_default': '0',
            'weight': '2',
            'is_optgroup': '0',
            'is_reserved': '0',
            'is_active': '1'
          },
          {
            'id': '1166',
            'option_group_id': '152',
            'label': 'Specific contact',
            'value': '3',
            'name': 'SPECIFIC_CONTACT',
            'filter': '0',
            'is_default': '0',
            'weight': '3',
            'is_optgroup': '0',
            'is_reserved': '0',
            'is_active': '1'
          },
          {
            'id': '1167',
            'option_group_id': '152',
            'label': 'User creating the case',
            'value': '4',
            'name': 'USER_CREATING_THE_CASE',
            'filter': '0',
            'is_default': '0',
            'weight': '4',
            'is_optgroup': '0',
            'is_reserved': '0',
            'is_active': '1'
          }
        ]
      };
    }
  };
});
