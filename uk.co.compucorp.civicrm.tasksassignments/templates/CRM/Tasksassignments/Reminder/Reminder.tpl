{include file='CRM/Tasksassignments/Reminder/Header.tpl'}
<span class="h4">Reminder: <a class="mlink" href="{$activityUrl}">{$activityName}</a></span>
{if $notes}
<table class="mtable notes" width="100%">
    <tr>
        <td width="15%">Notes:</td>
        <td>{$notes}</td>
    </tr>
</table>
{/if}
<hr/>
<table class="mtable" width="100%">
        <tr>
        <td width="15%">Contact:</td>
        <td>{$activityTargets}</td>
    </tr>
        <tr>
        <td width="15%">Assignee:</td>
        <td>{$activityAssignee}</td>
    </tr>
        <tr>
        <td width="15%">Task:</td>
        <td>{$activityType}</td>
    </tr>
        <tr>
        <td width="15%">Status:</td>
        <td>{$activityStatus}</td>
    </tr>
        <tr>
        <td width="15%">Due:</td>
        <td>{$activityDue}</td>
    </tr>
        <tr>
        <td width="15%">Subject:</td>
        <td>{$activitySubject}</td>
    </tr>
        <tr>
        <td width="15%">Details:</td>
        <td>{$activityDetails}</td>
    </tr>
</table>
<hr/>
{include file='CRM/Tasksassignments/Reminder/Footer.tpl'}