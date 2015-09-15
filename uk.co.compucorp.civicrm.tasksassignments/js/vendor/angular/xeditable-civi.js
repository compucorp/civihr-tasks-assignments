angular.module('xeditable-civi',['xeditable','textAngular']);
angular.module('xeditable-civi').config(['$provide', function($provide){
    $provide.decorator('editableDirectiveFactory', ['$delegate',function($delegate) {
        return function(overwrites){

            var dirObj = $delegate(overwrites);
            dirObj.compile = function(tEl){
                tEl.append('<i class="fa fa-pencil" />');
                return {
                    post: dirObj.link
                }
            };

            return dirObj;  
        };
    }]);
}]);

angular.module('xeditable').directive('editableUiSelect', [
    'editableDirectiveFactory','$timeout',
    function(editableDirectiveFactory, $timeout) {
        var linkOrg, dir;

        function rename(tag, el) {
            var newEl = angular.element('<' + tag + '/>'), attrs;

            newEl.html(el.html());
            attrs = el[0].attributes;
            for (var i = 0; i < attrs.length; ++i) {
                newEl.attr(attrs.item(i).nodeName, attrs.item(i).value);
            }
            return newEl;
        };

        dir = editableDirectiveFactory({
            directiveName: 'editableUiSelect',
            inputTpl: '<ui-select></ui-select>',
            uiSelectMatch: null,
            uiSelectChoices: null,
            render: function () {
                this.parent.render.call(this);

                this.inputEl.attr('ng-model','select.$data');
                this.inputEl.append(rename('ui-select-match', this.parent.uiSelectMatch));
                this.inputEl.append(rename('ui-select-choices', this.parent.uiSelectChoices));

            },
            save: function(){
                this.scope.$data = this.scope.select.$data;
                this.parent.save.call(this);
            },
            setLocalValue: function() {
                this.parent.setLocalValue.call(this);
                this.scope.select.$data = this.scope.$data;
            }

        });

        linkOrg = dir.link;

        dir.link = function (scope, el, attrs, ctrl) {
            var matchEl = el.find('editable-ui-select-match');
            var choicesEl = el.find('editable-ui-select-choices');

            ctrl[0].uiSelectMatch = matchEl.clone();
            ctrl[0].uiSelectChoices = choicesEl.clone();

            matchEl.remove();
            choicesEl.remove();

            scope.select = {};

            return linkOrg(scope, el, attrs, ctrl);
        };

        return dir;
    }]);

angular.module('xeditable').directive('editableTa', ['editableDirectiveFactory','$timeout',
    function(editableDirectiveFactory, $timeout) {
        var linkOrg, dir;

        dir = editableDirectiveFactory({
            directiveName: 'editableTa',
            inputTpl: '<text-angular></text-angular>',
            render: function() {
                this.parent.render.call(this);

                this.inputEl.parent().parent().removeClass('form-inline');
                this.inputEl.addClass('editable-ta');
                this.inputEl.attr('ng-model','ta.$data');
                this.inputEl.attr('ta-toolbar', this.attrs.eTaToolbar || '[["bold","italics","underline","strikeThrough","ul","ol","undo","redo","clear"]]');
            },
            save: function(){
                this.scope.$data = this.scope.ta.$data;
                this.parent.save.call(this);
            },
            setLocalValue: function() {
                this.parent.setLocalValue.call(this);
                this.scope.ta.$data = this.scope.$data;
            }
        });

        linkOrg = dir.link;

        dir.link = function (scope, el, attrs, ctrl) {

            scope.ta = {};

            return linkOrg(scope, el, attrs, ctrl);
        };

        return dir;
    }]);