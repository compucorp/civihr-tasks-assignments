#!groovy

pipeline {
  agent any

  parameters {
    string(name: 'BUILDNAME', defaultValue: "ta-dev_$BRANCH_NAME", description: 'T&A test site name')
    booleanParam(name: 'DESTROY_SITE', defaultValue: true, description: 'Destroy built site after build finish')
  }

  environment {
    WEBROOT = "/opt/buildkit/build/${params.BUILDNAME}"
    CIVICRM_EXT_ROOT = "$WEBROOT/sites/all/modules/civicrm/tools/extensions"
    EXTENSION_ROOT = "$CIVICRM_EXT_ROOT/civihr_tasks/uk.co.compucorp.civicrm.tasksassignments"
    WEBURL = "http://jenkins.compucorp.co.uk:8901"
    ADMIN_PASS = credentials('TEST_SITE_ADMIN_PASS')
    TEST_REPORTS = "$WORKSPACE/test-reports"
  }

  stages {
    stage('Pre-tasks execution') {
      steps {
        sendBuildStartdNotification()

        // Print all Environment variables
        sh 'printenv | sort'

        // Update buildkit
        sh "cd /opt/buildkit && git pull"

        // Destroy existing site
        sh "civibuild destroy ${params.BUILDNAME} || true"

        // Test build tools
        sh 'amp test'

        // Recreate the test reports folder to make sure it
        // will be empty when the tests run and there is no
        // risk of having results from previous tests there
        sh 'rm -rf $TEST_REPORTS'
        sh 'mkdir $TEST_REPORTS'
      }
    }

    stage('Build site') {
      steps {
        script {
          // Build site with CV Buildkit
          sh "civibuild create ${params.BUILDNAME} --type drupal-clean --civi-ver 4.7.27 --url $WEBURL --admin-pass $ADMIN_PASS"

          // Get target and PR branches name
          def prBranch = env.CHANGE_BRANCH
          def envBranch = env.CHANGE_TARGET ? env.CHANGE_TARGET : env.BRANCH_NAME
          if (prBranch != null && prBranch.startsWith("hotfix-")) {
            envBranch = 'master'
          }

          cloneRepositories(envBranch)

          if (prBranch) {
            checkoutPrBranchInRepositories(prBranch)
            mergeEnvBranchInAllRepositories(envBranch)
          }

          // The JS tests use the cv tool to find the path  of an extension.
          // For it to work, the extensions have to be installed on the site
          installExtensionAndDependencies()
        }
      }
    }

    stage('Run tests') {
      parallel {
        stage('Test PHP') {
          steps {
            sh """
              cd $EXTENSION_ROOT
              phpunit4 --log-junit $TEST_REPORTS/phpunit.xml
            """
          }
          post {
            always {
              step([
                $class: 'XUnitBuilder',
                thresholds: [
                  [
                    $class: 'FailedThreshold',
                    failureNewThreshold: '1',
                    failureThreshold: '1',
                    unstableNewThreshold: '1',
                    unstableThreshold: '1'
                  ]
                ],
                tools: [
                  [
                    $class: 'JUnitType',
                    pattern: 'test-reports/phpunit.xml'
                  ]
                ]
              ])
            }
          }
        }

        stage('Test JS') {
          steps {
            sh """
              cd $EXTENSION_ROOT
              yarn || true
              gulp test --reporters junit,progress || true
              ls -l
              mv test-reports/karma.xml $TEST_REPORTS/
            """
          }
          post {
            always {
              step([
                $class: 'XUnitBuilder',
                thresholds: [
                  [
                    $class: 'FailedThreshold',
                    failureNewThreshold: '1',
                    failureThreshold: '1',
                    unstableNewThreshold: '1',
                    unstableThreshold: '1'
                  ]
                ],
                tools: [
                  [
                    $class: 'JUnitType',
                    pattern: 'test-reports/karma.xml'
                  ]
                ]
              ])
            }
          }
        }
      }
    }
  }

  post {
    always {
      // Destroy built site
      script {
        if (params.DESTROY_SITE == true) {
          echo 'Destroying built site...'
          sh "civibuild destroy ${params.BUILDNAME} || true"
        }
      }
    }
    success {
      sendBuildSuccessNotification()
    }
    failure {
      sendBuildFailureNotification()
    }
  }
}

/*
 * Sends a notification when the build starts
 */
def sendBuildStartdNotification() {
  def message = 'Building ' + getBuildTargetLink() + '. ' + getReportLink()

  sendHipchatNotification('YELLOW', message)
}

/*
 * Sends a notification when the build is completed successfully
 */
def sendBuildSuccessNotification() {
  def message = getBuildTargetLink() + ' built successfully. Time: $BUILD_DURATION. ' + getReportLink()
  sendHipchatNotification('GREEN', message)
}

/*
 * Sends a notification when the build fails
 */
def sendBuildFailureNotification() {
  def message = 'Failed to build ' + getBuildTargetLink() + '. Time: $BUILD_DURATION. No. of failed tests: ${TEST_COUNTS,var=\"fail\"}. ' + getReportLink()
  sendHipchatNotification('RED', message)
}

/*
 * Sends a notification to Hipchat
 */
def sendHipchatNotification(String color, String message) {
  hipchatSend color: color, message: message, notify: true
}

/*
 * Returns a link to what is being built. If it's a PR, then it's a link to the pull request itself.
 * If it's a branch, then it's a link in the format http://github.com/org/repo/tree/branch
 */
def getBuildTargetLink() {
  if(buildIsForAPullRequest()) {
    return "<a href=\"${env.CHANGE_URL}\">\"${env.CHANGE_TITLE}\"</a>"
  }

  return '<a href="' + getRepositoryUrlForBuildBranch() + '">"' + env.BRANCH_NAME + '"</a>'
}

/*
 * Returns true if this build as triggered by a Pull Request.
 */
def buildIsForAPullRequest() {
  return env.CHANGE_URL != null
}

/*
 * Returns a URL pointing to branch currently being built
 */
def getRepositoryUrlForBuildBranch() {
  def repositoryURL = env.GIT_URL
  repositoryURL = repositoryURL.replace('.git', '')

  return repositoryURL + '/tree/' + env.BRANCH_NAME
}

/*
 * Returns the Blue Ocean build report URL for the current job
 */
def getReportLink() {
 return 'Click <a href="$BLUE_OCEAN_URL">here</a> to see the build report'
}

def cloneRepositories(String envBranch) {
  for (repo in listRepositories()) {
    sh """
      git clone ${repo.url} ${repo.folder}
      cd ${repo.folder}
      git checkout $envBranch || true
    """
  }
}

def checkoutPrBranchInRepositories(String branch) {
  echo 'Checking out PR branch'

  for (repo in listRepositories()) {
    sh """
      cd ${repo.folder}
      git checkout ${branch} || true
    """
  }
}

def mergeEnvBranchInAllRepositories(String envBranch) {
  echo 'Merging env branch'

  for (repo in listRepositories()) {
    sh """
      cd ${repo.folder}
      git merge origin/${envBranch} --no-edit || true
    """
  }
}

/*
 * Returns the T&A repository and the repositories of its dependencies.
 *
 * Note: T&A doesn't really dependent on CiviHR. It only depends on the
 * reqangular extension which, at the moment, is in the CiviHR repository
 */
def listRepositories() {
  return [
    [
      'url': 'https://github.com/civicrm/civihr.git',
      'folder': "$CIVICRM_EXT_ROOT/civihr"
    ],
    [
      'url': 'https://github.com/compucorp/civihr-tasks-assignments.git',
      'folder': "$CIVICRM_EXT_ROOT/civihr_tasks"
    ]
  ]
}

/*
 * Installs the T&A extension and its dependencies
 */
def installExtensionAndDependencies() {
  sh """
    cd $WEBROOT
    drush cvapi extension.refresh
    drush cvapi extension.install keys=org.civicrm.reqangular
    drush cvapi extension.install keys=uk.co.compucorp.civicrm.tasksassignments
  """
}
