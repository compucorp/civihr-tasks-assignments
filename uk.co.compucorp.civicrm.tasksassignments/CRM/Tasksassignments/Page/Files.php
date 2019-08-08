<?php

require_once 'CRM/Core/Page.php';

class CRM_Tasksassignments_Page_Files extends CRM_Core_Page {

  public static function fileList($postParams = null) {
    $return = true;
    if (empty($postParams)) {
        $postParams = $_GET;
        $return = false;
    }
    $result = [];
    $entityFiles = CRM_Core_BAO_File::getEntityFile( $postParams['entityTable'], $postParams['entityID'] );

    if($entityFiles) {
      foreach($entityFiles as $k => $file) {

        $result[] = [
          'entityTable' => $postParams['entityTable'],
          'entityID' => $postParams['entityID'],
          'fileID' => $file['fileID'],
          'fileType' => $file['mime_type'],
          'fileSize' => filesize($file['fullPath']),
          'name' => $file['fileName'],
          'url' => $file['url'],
        ];
      }
    }

    if ($return) {
        return $result;
    }
    echo html_entity_decode(stripcslashes(json_encode(['values' => $result])));
    CRM_Utils_System::civiExit( );
  }

  public static function fileDelete($postParams = null) {
    $return = true;
    if (empty($postParams)) {
        $postParams = $_GET;
        $return = false;
    }
    $fileId = $postParams['fileID'];
    $result = 0;

    CRM_Core_BAO_File::deleteEntityFile( $postParams['entityTable'], $postParams['entityID'], $fileTypeID = NULL, $fileId );

    list($path) = CRM_Core_BAO_File::path($fileId, $postParams['entityID'], NULL, NULL);
    if ($path === null)
    {
        $result = 1;
    }

    if ($return) {
        return $result;
    }
    echo html_entity_decode(stripcslashes(json_encode(array('values' => array(array('result' => $result))), true)));
    CRM_Utils_System::civiExit( );
  }

  public static function fileUpload() {
    $config = CRM_Core_Config::singleton();
    $postParams = $_POST;
    $result = 0;
    $dest = $config->customFileUploadDir;
    if ($dest != ''  && substr($dest, -1) != '/') {
      $dest .= '/';
    }

    $files = $_FILES;
    if(is_array($files) && !empty($files)) {
      foreach($files as $k => $v) {
        $fileName = self::makeFileName(basename($v['name']), $dest);
        $maxSize = @filesize($v['tmp_name']);

        $fileName = ($fileName != '') ? $fileName : basename($v['name']);
        if( is_uploaded_file($v['tmp_name']) ) {
          if( move_uploaded_file($v['tmp_name'], $dest . $fileName) ) {
            $fileparam['name'] = $fileName;
            $fileparam['uri'] = $fileName;
            $file_params = array(
              'version'       => 3,
              'file_type_id'  => null,
              'mime_type'     => $v['type'],
              'name'          => $fileName,
              'uri'           => $fileName,
              'upload_date'   => date('Y-m-d h:i:s', time()),
            );
            $file_save = civicrm_api('File','Create', $file_params);
            $newEntityFile = new CRM_Core_DAO_EntityFile();
            $newEntityFile->entity_id = $postParams['entityID'];
            $newEntityFile->entity_table = $postParams['entityTable'];
            $newEntityFile->file_id = $file_save['id'];
            $newEntityFile->save();
            $fileName = basename($v['name']);
            $result++;
          }
        }
      }
      /*civicrm_api3('Document', 'create', array(
          'sequential' => 1,
          'id' => $postParams['entityID'],
          'status_id' => 2,
      ));*/
    }

    echo html_entity_decode(stripcslashes(json_encode(array('values' => array(array('result' => $result))), true)));
    CRM_Utils_System::civiExit( );
  }

  static function fileZip() {
      $config = CRM_Core_Config::singleton();
      $dest = $config->customFileUploadDir;
      $params = $_GET;
      $files = array();
      $mimeType = 'application/zip';
      $ext = 'zip';
      $entityFiles = CRM_Core_BAO_File::getEntityFile( $params['entityTable'], $params['entityID'] );

      if (empty($entityFiles)) {
          CRM_Utils_System::civiExit();
      }

      $zipname = 'document_' . (int)$params['entityID'] . '_files';
      $contactQuery = 'SELECT c.sort_name, ov.label FROM civicrm_activity a
        LEFT JOIN civicrm_activity_contact ac ON a.id = ac.activity_id
        LEFT JOIN civicrm_contact c ON ac.contact_id = c.id
        LEFT JOIN civicrm_option_group og ON og.name = "activity_type"
        LEFT JOIN civicrm_option_value ov ON og.id = ov.option_group_id
        WHERE a.id = %1 AND ac.record_type_id = 3 AND ov.value = a.activity_type_id';
      $contactParams = array(
          1 => array($params['entityID'], 'Integer'),
      );
      $contactResult = CRM_Core_DAO::executeQuery($contactQuery, $contactParams);
      if ($contactResult->fetch()) {
          $zipname = CRM_Utils_String::munge($contactResult->sort_name) . '-' . CRM_Utils_String::munge($contactResult->label);
      }

      if (count($entityFiles) > 1) {
        foreach ($entityFiles as $entityFile) {
            if (!empty($entityFile['fullPath'])) {
              $files[] = $entityFile['fullPath'];
            }
        }

        if (empty($files)) {
            CRM_Utils_System::civiExit();
        }

        $zipname .= '.' . $ext;
        $zipfullpath = $dest . '/' . $zipname;
        $zip = new ZipArchive();
        // @see https://bugs.php.net/bug.php?id=71064
        $mode = ZipArchive::CREATE | ZipArchive::OVERWRITE;
        $zip->open($zipfullpath, $mode);
        foreach ($files as $file) {
          $zip->addFile($file, substr($file, strrpos($file, '/') + 1));
        }
        $zip->close();
      } else {
        $firstFile = CRM_Utils_Array::first($entityFiles);
        $zipfullpath = $firstFile['fullPath'];
        $mimeType = $firstFile['mime_type'];
        $parts = explode('.', $zipfullpath);
        $ext = end($parts);
        $zipname .= '.' . $ext;
      }

      header('Content-Type: ' . $mimeType);
      header('Content-disposition: attachment; filename='.$zipname);
      header('Content-Length: ' . filesize($zipfullpath));
      readfile($zipfullpath);

      CRM_Utils_System::civiExit();
  }

  /**
   * @param $name
   *
   * @return string
   */
  static function makeFileName($name, $dest) {
    $info     = pathinfo($name);
    $basename = substr($info['basename'],
      0, -(strlen(CRM_Utils_Array::value('extension', $info)) + (CRM_Utils_Array::value('extension', $info) == '' ? 0 : 1))
    );
    $filename = null;

    if (!CRM_Utils_File::isExtensionSafe(CRM_Utils_Array::value('extension', $info))) {
      // munge extension so it cannot have an embbeded dot in it
      // The maximum length of a filename for most filesystems is 255 chars.
      // We'll truncate at 240 to give some room for the extension.
      $filename = CRM_Utils_String::munge("{$basename}_" . CRM_Utils_Array::value('extension', $info), '_', 240) . ".unknown";
    }
    else {
      $filename = CRM_Utils_String::munge("{$basename}", '_', 240) . "." . CRM_Utils_Array::value('extension', $info);
    }

    $newFilename = $filename;
    $i = 1;
    while (file_exists($dest . $newFilename)) {
        $fileinfo = pathinfo($dest . $filename);
        $newFilename = $fileinfo['filename'] . '(' . $i++ . ')' . '.' . $fileinfo['extension'];
    }

    return $newFilename;
  }
}
