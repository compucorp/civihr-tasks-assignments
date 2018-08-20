<div crm-ui-field="{literal}{ name: 'caseTypeDetailForm.category', title: ts('Category') }{/literal}">
  {foreach from=$caseTypeCategoryOptions item=categoryOption}
  <label>
    <input type="radio"
      name="caseTypeCategory"
      value="{$categoryOption.value}"
      ng-model="caseType.custom_{$caseTypeCategoryFieldId}" />
      <span>{$categoryOption.label}</span>
  </label>
  {/foreach}
</div>
