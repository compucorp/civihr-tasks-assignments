<h1>Daily Task Reminder</h1>

<div>You have {math equation="x + y" x=$reminder.todayMine|@count y=$reminder.today_keydates_count} task(s) and document(s) due today. You have {$reminder.overdue|@count} overdue task(s).</div>

<div>
    
    {if $reminder.overdue}
    <h2 class="overdue">Overdue Tasks ({$reminder.overdue|@count})</h2>
        {foreach from=$reminder.overdue item=row}
            {include file='CRM/Tasksassignments/Reminder/DailyReminderActivity.tpl'}
        {/foreach}
    {/if}
    
    {if $reminder.today_mine}
    <h2 class="today-mine">Today's Tasks and Documents ({$reminder.today_mine|@count})</h2>
        {foreach from=$reminder.today_mine item=row}
            {include file='CRM/Tasksassignments/Reminder/DailyReminderActivity.tpl'}
        {/foreach}
    {/if}
    
    {if $reminder.today_others}
    <h2 class="today-others">Today's Tasks for others ({$reminder.today_others|@count})</h2>
        {foreach from=$reminder.today_others item=row}
            {include file='CRM/Tasksassignments/Reminder/DailyReminderActivity.tpl'}
        {/foreach}
    {/if}
    
    {if $reminder.coming_up}
    <h2 class="coming-up">Coming up this week ({$reminder.coming_up|@count})</h2>
        {foreach from=$reminder.coming_up item=row}
            {include file='CRM/Tasksassignments/Reminder/DailyReminderActivity.tpl'}
        {/foreach}
    {/if}
    
    {if $reminder.upcoming_keydates}
    <h2 class="coming-up">Upcoming Key Dates ({$reminder.upcoming_keydates|@count})</h2>
        {foreach from=$reminder.upcoming_keydates item=row}
            {include file='CRM/Tasksassignments/Reminder/DailyReminderKeyDate.tpl'}
        {/foreach}
    {/if}
    
</div>

<a href="{$myTasksUrl}">See my tasks</a>
<a href="{$myDocumentsUrl}">See my documents</a>
