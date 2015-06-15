<table class="mtable" width="100%">
        <tr>
        <td width="80%" align="left">
            <a href="{$row.activityUrl}">{$row.type}</a>&nbsp;&nbsp;&nbsp;&nbsp;<strong>Assigned to:</strong> {', '|implode:$row.assignee}
        </td>
        <td align="right">
                {$row.date}
        </td>
    </tr>
    <tr>
        <td align="left">
            <table class="mtable subtable" width="100%">
                    <tr>
                    <td width="50%" align="left">
                            Contact: {', '|implode:$row.targets}
                    </td>
                    <td align="left" valign="top">
{if $row.caseType}
                            Assignment Type: {$row.caseType}
{/if}
                        &nbsp;
                    </td>
                </tr>
            </table>
        </td>
        <td>
                &nbsp;
        </td>
    </tr>
</table>
<hr/>
