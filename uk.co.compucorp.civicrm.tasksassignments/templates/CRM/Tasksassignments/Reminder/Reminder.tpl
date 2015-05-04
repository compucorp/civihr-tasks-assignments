<h3>Reminder: <a href="{$activityUrl}">{$activityName}</a></h3>

{if $notes}
Notes: {$notes}
{/if}

Contact: {$activityTargets}
Assignee: {$activityAssignee}
Task: {$activityType}
Status: {$activityStatus}
Due: {$activityDue}
Subject: {$activitySubject}
Details: {$activityDetails}

<a href="{$myTasksUrl}">See my tasks</a>
<a href="{$myDocumentsUrl}">See my documents</a>
