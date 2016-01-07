<table class="mtable" width="100%" style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">
    <tr style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">
        <td width="80%" align="left" style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">
            <a href="{$row.appraisal_url}" style="color:#42b0cb;font-weight:normal;text-decoration:underline;">{$row.contact_name} - Status: <span class="status-{$row.status}">{$row.status}</span></a>
        </td>
        <td align="right" style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">
                {$row.due}
        </td>
    </tr>
    <tr style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">
        <td align="left" style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">
            <table class="mtable subtable" width="100%" style="margin: 0px;padding: 0px;border: 0;vertical-align: top;font-size: 12px;">
                <tr style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">
                    <td width="50%" align="left" style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">
                            Appraiser: {$row.manager_name}
                    </td>
                    <td align="left" valign="top" style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">
                            Appraisal Cycle Type: {$row.cycle_type}
                        &nbsp;
                    </td>
                </tr>
            </table>
        </td>
        <td style="margin: 0px;padding: 0px;border: 0;vertical-align: top;">
                &nbsp;
        </td>
    </tr>
</table>
<hr style="height:0px;border:0px none;border-bottom:1px solid;border-color:#e0e0e0;margin:16px 0 10px;"/>
