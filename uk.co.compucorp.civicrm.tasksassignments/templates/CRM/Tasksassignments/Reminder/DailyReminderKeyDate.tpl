<table class="mtable" width="100%">
        <tr>
        <td width="80%" align="left">
            {$row.label}
        </td>
        <td align="right">
            {$row.keydate}
        </td>
    </tr>
    <tr>
        <td align="left">
            <table class="mtable subtable" width="100%">
                <tr>
                    <td width="100%" align="left">
                        Contact: <a href="{$baseUrl}/civicrm/contact/view?reset=1&cid={$row.contact_id}">{$row.contact_name}</a>
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
