DELETE FROM `civicrm_option_value` WHERE component_id = (SELECT id FROM `civicrm_component` WHERE name = 'CiviDocument');

DELETE FROM `civicrm_component` WHERE name = 'CiviDocument';

INSERT INTO `civicrm_component` (`id`, `name`, `namespace`) VALUES (NULL, 'CiviDocument', 'CRM_CiviDocument');
