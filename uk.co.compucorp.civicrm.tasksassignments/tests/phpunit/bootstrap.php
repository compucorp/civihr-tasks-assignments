<?php

ini_set('memory_limit', '2G');
ini_set('safe_mode', 0);

eval(cv('php:boot --level=full -t', 'phpcode'));

define('DRUPAL_ROOT', realpath($GLOBALS["civicrm_root"] . '../../../..'));
require_once DRUPAL_ROOT . '/includes/bootstrap.inc';
drupal_bootstrap(DRUPAL_BOOTSTRAP_FULL);

addCiviHRExtensionToIncludePath('/uk.co.compucorp.civicrm.hrcore/');

require_once 'TasksassignmentsTestTrait.php';

function addCiviHRExtensionToIncludePath($extensionDirectory) {
  $civicrmRoot = realpath($GLOBALS['civicrm_root']);
  $civiHRDir = $civicrmRoot . '/tools/extensions/civihr';
  $extensionDir = $civiHRDir . $extensionDirectory;
  set_include_path($extensionDir . PATH_SEPARATOR . get_include_path());
}

/**
 * Call the "cv" command.
 *
 * @param string $cmd
 *   The rest of the command to send.
 * @param string $decode
 *   Ex: 'json' or 'phpcode'.
 * @return string
 *   Response output (if the command executed normally).
 * @throws \RuntimeException
 *   If the command terminates abnormally.
 */
function cv($cmd, $decode = 'json') {
  $cmd = 'cv ' . $cmd;
  $descriptorSpec = array(0 => array("pipe", "r"), 1 => array("pipe", "w"), 2 => STDERR);
  $oldOutput = getenv('CV_OUTPUT');
  putenv("CV_OUTPUT=json");
  $process = proc_open($cmd, $descriptorSpec, $pipes, __DIR__);
  putenv("CV_OUTPUT=$oldOutput");
  fclose($pipes[0]);
  $result = stream_get_contents($pipes[1]);
  fclose($pipes[1]);
  if (proc_close($process) !== 0) {
    throw new RuntimeException("Command failed ($cmd):\n$result");
  }
  switch ($decode) {
    case 'raw':
      return $result;

    case 'phpcode':
      // If the last output is /*PHPCODE*/, then we managed to complete execution.
      if (substr(trim($result), 0, 12) !== "/*BEGINPHP*/" || substr(trim($result), -10) !== "/*ENDPHP*/") {
        throw new \RuntimeException("Command failed ($cmd):\n$result");
      }
      return $result;

    case 'json':
      return json_decode($result, 1);

    default:
      throw new RuntimeException("Bad decoder format ($decode)");
  }
}
