{include file='CRM/Tasksassignments/Reminder/Header.tpl'}
<span class="h4" style="color:#202020;display:block;font-family:Arial;font-size:22px;font-weight:normal;line-height:100%;margin-bottom:10px;text-align:left;">{if $isReminder}Reminder: {/if}<a class="mlink" style="color:#42b0cb;font-weight:normal;text-decoration:underline;" href="{$activityUrl}">{$activityName}</a></span>
{if $notes}
<table class="mtable notes" style="margin: 0px;padding: 0px;border: 0;vertical-align: top;margin-top:8px;" width="100%">
    <tr style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">
        <td width="15%" style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">Notes:</td>
        <td style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">{$notes}</td>
    </tr>
</table>
{/if}
<hr style="height:0px;border:0px none;border-bottom:1px solid;border-color:#e0e0e0;margin:16px 0 10px;"/>
<table class="mtable" style="margin: 0px;padding: 0px;border: 0;vertical-align: top;" width="100%">
{if $activityTargets}
    <tr style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">
        <td width="15%" style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">Contact:</td>
        <td style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">{$activityTargets}</td>
    </tr>
{/if}
{if $activityAssignee}
    <tr style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">
        <td width="15%" style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">
            {if $previousAssignee}
                New Assignee:
            {else}
                Assignee:
            {/if}
        </td>
        <td style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">{$activityAssignee}</td>
    </tr>
{/if}
{if $previousAssignee}
    <tr style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">
        <td width="25%" style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">Original Assignee:</td>
        <td style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">{$previousAssignee}</td>
    </tr>
{/if}
{if $activityType}
    <tr style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">
        <td width="15%" style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">Task:</td>
        <td style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">{$activityType}</td>
    </tr>
{/if}
    <tr style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">
        <td width="15%" style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">Status:</td>
        <td style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">{$activityStatus}</td>
    </tr>
{if $activityDue}
    <tr style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">
        <td width="15%" style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">Due:</td>
        <td style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">{$activityDue}</td>
    </tr>
{/if}
{if $activitySubject}
    <tr style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">
        <td width="15%" style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">Subject:</td>
        <td style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">{$activitySubject|strip_tags}</td>
    </tr>
{/if}
{if $activityDetails}
    <tr style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">
        <td width="15%" style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">Details:</td>
        <td style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">{$activityDetails}</td>
    </tr>
{/if}
</table>
<hr style="height:0px;border:0px none;border-bottom:1px solid;border-color:#e0e0e0;margin:16px 0 10px;"/>
{include file='CRM/Tasksassignments/Reminder/Footer.tpl'}
