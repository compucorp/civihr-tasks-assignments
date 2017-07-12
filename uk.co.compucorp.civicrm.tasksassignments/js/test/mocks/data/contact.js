/* eslint-env amd */

define([
  'mocks/fabricators/contact'
], function (contactFabricator) {
  return {
    onGetContacts: {
      is_error: 0,
      values: contactFabricator.list()
    }
  };
});
