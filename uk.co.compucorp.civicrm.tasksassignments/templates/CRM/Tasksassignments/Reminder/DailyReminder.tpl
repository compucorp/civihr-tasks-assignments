<h1>Daily Task Reminder</h1>

<div>You have {$reminder.todayMine|@count} task(s) and document(s) due today. You have {$reminder.overdue|@count} overdue task(s).</div>

<div>
    
    {if $reminder.overdue}
    <h2 class="overdue">Overdue Tasks ({$reminder.overdue|@count})</h2>
        {foreach from=$reminder.overdue item=row}
            {include file='CRM/Tasksassignments/Reminder/DailyReminderActivity.tpl'}
        {/foreach}
    {/if}
    
    {if $reminder.todayMine}
    <h2 class="today-mine">Today's Tasks and Documents ({$reminder.todayMine|@count})</h2>
        {foreach from=$reminder.todayMine item=row}
            {include file='CRM/Tasksassignments/Reminder/DailyReminderActivity.tpl'}
        {/foreach}
    {/if}
    
    {if $reminder.todayOthers}
    <h2 class="today-others">Today's Tasks for others ({$reminder.todayOthers|@count})</h2>
        {foreach from=$reminder.todayOthers item=row}
            {include file='CRM/Tasksassignments/Reminder/DailyReminderActivity.tpl'}
        {/foreach}
    {/if}
    
    {if $reminder.comingUp}
    <h2 class="coming-up">Coming up this week ({$reminder.comingUp|@count})</h2>
        {foreach from=$reminder.comingUp item=row}
            {include file='CRM/Tasksassignments/Reminder/DailyReminderActivity.tpl'}
        {/foreach}
    {/if}
    
    {if $reminder.upcomingKeyDates}
    <h2 class="coming-up">Upcoming Key Dates ({$reminder.upcomingKeyDates|@count})</h2>
        {foreach from=$reminder.upcomingKeyDates item=row}
            {* TODO! *}
        {/foreach}
    {/if}
    
</div>

<a href="{$myTasksUrl}">See my tasks</a>
<a href="{$myDocumentsUrl}">See my documents</a>
