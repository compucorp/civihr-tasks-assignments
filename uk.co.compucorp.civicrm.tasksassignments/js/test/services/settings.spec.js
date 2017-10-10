/* eslint-env amd, jasmine */

define([
  'common/lodash',
  'mocks/data/app-settings',
  'tasks-assignments/app'
], function (_, settingsMock) {
  'use strict';

  var mockBackendCalls = function ($httpBackend) {
    $httpBackend.whenGET(/views.*/).respond({});
    $httpBackend.whenGET(/action=*/).respond({});
  };

  describe('AppSettingsService', function () {
    var AppSettings, AppSettingsService, $httpBackend, promiseResult;

    beforeEach(module('civitasks.appDashboard'));

    beforeEach(inject(function (_AppSettingsService_, _AppSettings_, _$httpBackend_) {
      AppSettingsService = _AppSettingsService_;
      AppSettings = _AppSettings_;
      $httpBackend = _$httpBackend_;
    }));

    beforeEach(function () {
      $httpBackend.whenGET(/action=get&debug=true&entity=Setting/).respond(settingsMock.onGet);
      mockBackendCalls($httpBackend);
      spyOn(AppSettings, 'get').and.callThrough();

      AppSettingsService.get(['maxFileSize']).then(function (maxFileSize) {
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
