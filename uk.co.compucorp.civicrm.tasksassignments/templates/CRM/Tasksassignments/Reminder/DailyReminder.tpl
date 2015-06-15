{include file='CRM/Tasksassignments/Reminder/Header.tpl'}
<span class="h4">Daily Task Reminder</span>
You have {math equation="x + y" x=$reminder.todayMine|@count y=$reminder.today_keydates_count} task(s) and document(s) due today. You have {$reminder.overdue|@count} overdue task(s).

{if $reminder.overdue}
<span class="h4 dailyreminder overdue">Overdue Tasks ({$reminder.overdue|@count})</span>
                                                                <hr/>
    {foreach from=$reminder.overdue item=row}
        {include file='CRM/Tasksassignments/Reminder/DailyReminderActivity.tpl'}
    {/foreach}
{/if}

{if $reminder.today_mine}
<span class="h4 dailyreminder today-mine">Today's Tasks and Documents ({$reminder.today_mine|@count})</span>
    {foreach from=$reminder.today_mine item=row}
        {include file='CRM/Tasksassignments/Reminder/DailyReminderActivity.tpl'}
    {/foreach}
{/if}

{if $reminder.today_others}
<span class="h4 dailyreminder today-others">Today's Tasks for others ({$reminder.today_others|@count})</span>
    {foreach from=$reminder.today_others item=row}
        {include file='CRM/Tasksassignments/Reminder/DailyReminderActivityOthers.tpl'}
    {/foreach}
{/if}

{if $reminder.coming_up}
<span class="h4 dailyreminder coming-up">Coming up this week ({$reminder.coming_up|@count})</span>
    {foreach from=$reminder.coming_up item=row}
        {include file='CRM/Tasksassignments/Reminder/DailyReminderActivity.tpl'}
    {/foreach}
{/if}

{if $reminder.upcoming_keydates}
<span class="h4 dailyreminder upcoming-keydates">Upcoming Key Dates ({$reminder.upcoming_keydates|@count})</span>
    {foreach from=$reminder.upcoming_keydates item=row}
        {include file='CRM/Tasksassignments/Reminder/DailyReminderKeyDate.tpl'}
    {/foreach}
{/if}
{include file='CRM/Tasksassignments/Reminder/Footer.tpl'}