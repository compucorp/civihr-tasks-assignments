DELETE FROM `civicrm_option_value` WHERE component_id = (SELECT id FROM `civicrm_component` WHERE name = 'CiviTask');

DELETE FROM `civicrm_component` WHERE name = 'CiviTask';

INSERT INTO `civicrm_component` (`id`, `name`, `namespace`) VALUES (NULL, 'CiviTask', 'CRM_CiviTask');
