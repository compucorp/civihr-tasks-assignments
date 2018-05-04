'use strict';

(function init () {
  var componentIdRow = CRM.$('select#component_id').parents('tr');
  var tableBody = componentIdRow.parents('tbody');

  // Move the category field to the top of the form:
  componentIdRow.detach().prependTo(tableBody);
})();
