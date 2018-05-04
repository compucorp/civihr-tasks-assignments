'use strict';

(function init (CRM) {
  var componentIdRow = CRM.$('#component_id').closest('tr');
  var tableBody = componentIdRow.closest('tbody');

  // Move the category field to the top of the form:
  componentIdRow.prependTo(tableBody);
})(CRM);
