{include file='CRM/Tasksassignments/Reminder/Header.tpl'}
<span class="h4" style="color:#202020;display:block;font-family:Arial;font-size:22px;font-weight:normal;line-height:100%;margin-bottom:10px;text-align:left;">{ts}Daily Not Approved Documents Notification{/ts}</span>

{if $notification.overdue}
<span class="h4 dailyreminder overdue" style="color:#202020;display:block;font-family:Arial;font-size:18px;font-weight:normal;line-height:100%;margin-bottom:10px;text-align:left;margin-top: 16px;margin-bottom: 16px;">{ts}Overdue Documents{/ts} ({$notification.overdue|@count})</span>
<hr style="height:0px;border:0px none;border-bottom:1px solid;border-color:#e0e0e0;margin:16px 0 10px;"/>
    {foreach from=$notification.overdue item=row}
        {include file='CRM/Tasksassignments/Reminder/Document.tpl'}
    {/foreach}
{/if}

{if $notification.plus14}
<span class="h4 dailyreminder coming-up" style="color:#202020;display:block;font-family:Arial;font-size:18px;font-weight:normal;line-height:100%;margin-bottom:10px;text-align:left;margin-top: 16px;margin-bottom: 16px;">{ts}Documents due in next fortnight{/ts} ({$notification.plus14|@count})</span>
<hr style="height:0px;border:0px none;border-bottom:1px solid;border-color:#e0e0e0;margin:16px 0 10px;"/>
    {foreach from=$notification.plus14 item=row}
        {include file='CRM/Tasksassignments/Reminder/Document.tpl'}
    {/foreach}
{/if}

{if $notification.plus90}
<span class="h4 dailyreminder coming-up" style="color:#202020;display:block;font-family:Arial;font-size:18px;font-weight:normal;line-height:100%;margin-bottom:10px;text-align:left;margin-top: 16px;margin-bottom: 16px;">{ts}Documents due in next 90 days{/ts} ({$notification.plus90|@count})</span>
<hr style="height:0px;border:0px none;border-bottom:1px solid;border-color:#e0e0e0;margin:16px 0 10px;"/>
    {foreach from=$notification.plus90 item=row}
        {include file='CRM/Tasksassignments/Reminder/Document.tpl'}
    {/foreach}
{/if}

{include file='CRM/Tasksassignments/Reminder/Footer.tpl'}