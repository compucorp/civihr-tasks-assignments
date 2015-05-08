            <div class="activity-block">
                <div class="activity-type"><a href="{$row.activityUrl}">{$row.type}</a></div>
                <div class="activity-status">{$row.status}</div>
                <div class="activity-targets">Contact: {', '|implode:$row.targets}</div>
                {if $row.caseType}
                <div class="case-type">Assignment Type: {$row.caseType}</div>
                {/if}
                <div class="date">{$row.date}</div>
            </div>
