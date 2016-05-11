define([], function () {
  'use strict';

  return [
    '$delegate',

    /**
     * This decorator is used to hide the "Follow link" button 
     * inserted by "org.civicrm.reqangular/src/common/decorators/xeditable-civi/editable-directive-factory.js"
     */
    function ($delegate) {
      return function (overwrites) {
        var dirObj = $delegate(overwrites);
        dirObj.compile = function (tEl) {
          if (tEl[0].attributes.getNamedItem('ng-href')) {
            return {
              post: dirObj.link
            };
          }
        }
        return dirObj;
      }
    }
  ];
});
