/* eslint-env amd, jasmine */

define([
  'common/lodash',
  'mocks/data/app-settings.data',
  'tasks-assignments/modules/tasks-assignments.dashboard.module'
], function (_, settingsMock) {
  'use strict';

  var mockBackendCalls = function ($httpBackend) {
    $httpBackend.whenGET(/views.*/).respond({});
    $httpBackend.whenGET(/action=*/).respond({});
  };

  describe('appSettingsService', function () {
    var AppSettings, appSettingsService, $httpBackend, promiseResult;

    beforeEach(module('tasks-assignments.dashboard'));

    beforeEach(inject(function (_appSettingsService_, _AppSettings_, _$httpBackend_) {
      appSettingsService = _appSettingsService_;
      AppSettings = _AppSettings_;
      $httpBackend = _$httpBackend_;
    }));

    beforeEach(function () {
      $httpBackend.whenGET(/action=get&debug=true&entity=contact/).respond({ values: [ jasmine.any(Object) ] });
      $httpBackend.whenGET(/action=get&entity=CaseType/).respond({ values: [ jasmine.any(Object) ] });
      $httpBackend.whenGET(/action=get&debug=true&entity=Setting/).respond(settingsMock.onGet);

      mockBackendCalls($httpBackend);
      spyOn(AppSettings, 'get').and.callThrough();

      appSettingsService.get(['maxFileSize']).then(function (maxFileSize) {
        promiseResult = maxFileSize;
      });
    });

    afterEach(function () {
      $httpBackend.flush();
    });

    describe('get()', function () {
      it('calls AppSettings get() to get maxFileSize values', function () {
        expect(AppSettings.get).toHaveBeenCalledWith({ sequential: 1, debug: true, return: [ 'maxFileSize' ] }, jasmine.any(Function), jasmine.any(Function));
      });

      it('returns the maxFileSize value', function () {
        expect(promiseResult).toEqual(settingsMock.onGet.values);
      });
    });
  });
});
