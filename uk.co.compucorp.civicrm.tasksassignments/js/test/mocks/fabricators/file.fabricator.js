/* eslint-env amd */

define(function () {
  return {
    single: function () {
      return {
        '_file': { 'size': '10023' }
      };
    },
    list: function () {
      return [
        {
          '_file': { 'size': '10023' }
        },
        {
          '_file': { 'size': '20023' }
        },
        {
          '_file': { 'size': '30023' }
        }
      ];
    }
  };
});
