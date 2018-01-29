/* eslint-env amd */

define([
  'mocks/fabricators/contact.fabricator'
], function (contactFabricator) {
  return {
    onGetContacts: {
      is_error: 0,
      values: contactFabricator.list()
    }
  };
});
