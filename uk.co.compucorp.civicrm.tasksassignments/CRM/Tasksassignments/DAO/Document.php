<?php

require_once 'CRM/Core/DAO.php';
require_once 'CRM/Utils/Type.php';
class CRM_Tasksassignments_DAO_Document extends CRM_Activity_BAO_Activity
{
  /**
   * static instance to hold the table name
   *
   * @var string
   * @static
   */
  static $_tableName = 'civicrm_activity';
  /**
   * static instance to hold the field values
   *
   * @var array
   * @static
   */
  static $_fields = null;
  /**
   * static instance to hold the keys used in $_fields for each field.
   *
   * @var array
   * @static
   */
  static $_fieldKeys = null;
  /**
   * static instance to hold the FK relationships
   *
   * @var string
   * @static
   */
  static $_links = null;
  /**
   * static instance to hold the values that can
   * be imported
   *
   * @var array
   * @static
   */
  static $_import = null;
  /**
   * static instance to hold the values that can
   * be exported
   *
   * @var array
   * @static
   */
  static $_export = null;
  /**
   * static value to see if we should log any modifications to
   * this table in the civicrm_log table
   *
   * @var boolean
   * @static
   */
  static $_log = true;
  /**
   * Unique  Other Activity ID
   *
   * @var int unsigned
   */
  public $id;
  /**
   * Artificial FK to original transaction (e.g. contribution) IF it is not an Activity. Table can be figured out through activity_type_id, and further through component registry.
   *
   * @var int unsigned
   */
  public $source_record_id;//
  /**
   * FK to civicrm_option_value.id, that has to be valid, registered activity type.
   *
   * @var int unsigned
   */
  public $activity_type_id;
  /**
   * The subject/purpose/short description of the activity.
   *
   * @var string
   */
  public $subject;
  /**
   * Date and time this activity is scheduled to occur. Formerly named scheduled_date_time.
   *
   * @var datetime
   */
  public $activity_date_time;//
  /**
   * Planned or actual duration of activity expressed in minutes. Conglomerate of former duration_hours and duration_minutes.
   *
   * @var int unsigned
   */
  public $duration;//
  /**
   * Location of the activity (optional, open text).
   *
   * @var string
   */
  public $location;//
  /**
   * Phone ID of the number called (optional - used if an existing phone number is selected).
   *
   * @var int unsigned
   */
  public $phone_id;//
  /**
   * Phone number in case the number does not exist in the civicrm_phone table.
   *
   * @var string
   */
  public $phone_number;//
  /**
   * Details about the activity (agenda, notes, etc).
   *
   * @var text
   */
  public $details;
  /**
   * ID of the status this activity is currently in. Foreign key to civicrm_option_value.
   *
   * @var int unsigned
   */
  public $status_id;
  /**
   * ID of the priority given to this activity. Foreign key to civicrm_option_value.
   *
   * @var int unsigned
   */
  public $priority_id;//
  /**
   * Parent meeting ID (if this is a follow-up item). This is not currently implemented
   *
   * @var int unsigned
   */
  public $parent_id;//
  /**
   *
   * @var boolean
   */
  public $is_test;//
  /**
   * Activity Medium, Implicit FK to civicrm_option_value where option_group = encounter_medium.
   *
   * @var int unsigned
   */
  public $medium_id;//
  /**
   *
   * @var boolean
   */
  public $is_auto;//
  /**
   * FK to Relationship ID
   *
   * @var int unsigned
   */
  public $relationship_id;//
  /**
   *
   * @var boolean
   */
  public $is_current_revision;//
  /**
   * Activity ID of the first activity record in versioning chain.
   *
   * @var int unsigned
   */
  public $original_id;//
  /**
   * Currently being used to store result id for survey activity, FK to option value.
   *
   * @var string
   */
  public $result;//
  /**
   *
   * @var boolean
   */
  public $is_deleted;//
  /**
   * The campaign for which this activity has been triggered.
   *
   * @var int unsigned
   */
  public $campaign_id;//
  /**
   * Assign a specific level of engagement to this activity. Used for tracking constituents in ladder of engagement.
   *
   * @var int unsigned
   */
  public $engagement_level;//
  /**
   *
   * @var int
   */
  public $weight;//
  /**
   * class constructor
   *
   * @access public
   * @return civicrm_activity
   */
  function __construct()
  {
    $this->__table = 'civicrm_activity';
    parent::__construct();
  }
  /**
   * return foreign keys and entity references
   *
   * @static
   * @access public
   * @return array of CRM_Core_Reference_Interface
   */
  static function getReferenceColumns()
  {
    if (!self::$_links) {
      self::$_links = static ::createReferenceColumns(__CLASS__);
      //self::$_links[] = new CRM_Core_Reference_Basic(self::getTableName() , 'phone_id', 'civicrm_phone', 'id');
      //self::$_links[] = new CRM_Core_Reference_Basic(self::getTableName() , 'parent_id', 'civicrm_activity', 'id');
      //self::$_links[] = new CRM_Core_Reference_Basic(self::getTableName() , 'relationship_id', 'civicrm_relationship', 'id');
      //self::$_links[] = new CRM_Core_Reference_Basic(self::getTableName() , 'original_id', 'civicrm_activity', 'id');
      //self::$_links[] = new CRM_Core_Reference_Basic(self::getTableName() , 'campaign_id', 'civicrm_campaign', 'id');
    }
    return self::$_links;
  }
  /**
   * returns all the column names of this table
   *
   * @access public
   * @return array
   */
  static function &fields()
  {
    if (!(self::$_fields)) {
      self::$_fields = array(
        'activity_id' => array(
          'name' => 'id',
          'type' => CRM_Utils_Type::T_INT,
          'title' => ts('Document ID') ,
          'required' => true,
          'import' => true,
          'where' => 'civicrm_activity.id',
          'headerPattern' => '',
          'dataPattern' => '',
          'export' => true,
        ) ,
        'activity_type_id' => array(
          'name' => 'activity_type_id',
          'type' => CRM_Utils_Type::T_INT,
          'title' => ts('Document Type') ,
          'required' => true,
          'import' => true,
          'where' => 'civicrm_activity.activity_type_id',
          'headerPattern' => '/(activity.)?type(.id$)/i',
          'dataPattern' => '',
          'export' => false,
          'default' => '1',
          'html' => array(
            'type' => 'Select',
          ) ,
          'pseudoconstant' => array(
            'optionGroupName' => 'activity_type',
          )
        ) ,
        'activity_subject' => array(
          'name' => 'subject',
          'type' => CRM_Utils_Type::T_STRING,
          'title' => ts('Subject') ,
          'maxlength' => 255,
          'size' => CRM_Utils_Type::HUGE,
          'import' => true,
          'where' => 'civicrm_activity.subject',
          'headerPattern' => '/(activity.)?subject/i',
          'dataPattern' => '',
          'export' => true,
          'html' => array(
            'type' => 'Text',
          ) ,
        ) ,
        'activity_date_time' => array(
          'name' => 'activity_date_time',
          'type' => CRM_Utils_Type::T_DATE + CRM_Utils_Type::T_TIME,
          'title' => ts('Document Date') ,
          'import' => true,
          'where' => 'civicrm_activity.activity_date_time',
          'headerPattern' => '/(activity.)?date(.time$)?/i',
          'dataPattern' => '',
          'export' => true,
          'html' => array(
            'type' => 'Select Date',
          ) ,
        ) ,
        'activity_details' => array(
          'name' => 'details',
          'type' => CRM_Utils_Type::T_TEXT,
          'title' => ts('Details') ,
          'rows' => 8,
          'cols' => 60,
          'import' => true,
          'where' => 'civicrm_activity.details',
          'headerPattern' => '/(activity.)?detail(s)?$/i',
          'dataPattern' => '',
          'export' => true,
          'html' => array(
            'type' => 'RichTextEditor',
          ) ,
        ) ,
        'activity_status_id' => array(
          'name' => 'status_id',
          'type' => CRM_Utils_Type::T_INT,
          'title' => ts('Document Status') ,
          'import' => true,
          'where' => 'civicrm_activity.status_id',
          'headerPattern' => '/(activity.)?status(.label$)?/i',
          'dataPattern' => '',
          'export' => false,
          'html' => array(
            'type' => 'Select',
          ) ,
          'pseudoconstant' => array(
            'optionGroupName' => 'document_status',
          )
        ) ,
        'activity_is_deleted' => array(
          'name' => 'is_deleted',
          'type' => CRM_Utils_Type::T_BOOLEAN,
          'title' => ts('Document is in the Trash') ,
          'import' => true,
          'where' => 'civicrm_activity.is_deleted',
          'headerPattern' => '/(activity.)?(trash|deleted)/i',
          'dataPattern' => '',
          'export' => true,
          'html' => array(
            'type' => 'Text',
          ) ,
        ) ,
      );
    }
    return self::$_fields;
  }
  /**
   * Returns an array containing, for each field, the arary key used for that
   * field in self::$_fields.
   *
   * @access public
   * @return array
   */
  static function &fieldKeys()
  {
    if (!(self::$_fieldKeys)) {
      self::$_fieldKeys = array(
        'id' => 'activity_id',
        'activity_type_id' => 'activity_type_id',
        'subject' => 'activity_subject',
        'date_time' => 'activity_date_time',
        'details' => 'activity_details',
        'status_id' => 'activity_status_id',
        'is_deleted' => 'activity_is_deleted',
      );
    }
    return self::$_fieldKeys;
  }
  /**
   * returns the names of this table
   *
   * @access public
   * @static
   * @return string
   */
  static function getTableName()
  {
    return self::$_tableName;
  }
  /**
   * returns if this table needs to be logged
   *
   * @access public
   * @return boolean
   */
  function getLog()
  {
    return self::$_log;
  }
  /**
   * returns the list of fields that can be imported
   *
   * @access public
   * return array
   * @static
   */
  static function &import($prefix = false)
  {
    if (!(self::$_import)) {
      self::$_import = array();
      $fields = self::fields();
      foreach($fields as $name => $field) {
        if (CRM_Utils_Array::value('import', $field)) {
          if ($prefix) {
            self::$_import['activity'] = & $fields[$name];
          } else {
            self::$_import[$name] = & $fields[$name];
          }
        }
      }
    }
    return self::$_import;
  }
  /**
   * returns the list of fields that can be exported
   *
   * @access public
   * return array
   * @static
   */
  static function &export($prefix = false)
  {
    if (!(self::$_export)) {
      self::$_export = array();
      $fields = self::fields();
      foreach($fields as $name => $field) {
        if (CRM_Utils_Array::value('export', $field)) {
          if ($prefix) {
            self::$_export['activity'] = & $fields[$name];
          } else {
            self::$_export[$name] = & $fields[$name];
          }
        }
      }
    }
    return self::$_export;
  }
}
