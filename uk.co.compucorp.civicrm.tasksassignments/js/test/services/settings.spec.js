/* eslint-env amd, jasmine */

define([
  'common/lodash',
  'mocks/data/app-settings',
  'tasks-assignments/app'
], function (_, settingsMock) {
  'use strict';

  var mockBackendCalls = function ($httpBackend) {
    $httpBackend.whenGET(/views.*/).respond({});
    $httpBackend.whenGET(/action=getoptions&debug=true&entity=Task/).respond({});
    $httpBackend.whenGET(/action=getoptions&debug=true&entity=Document/).respond({});
    $httpBackend.whenGET(/action=get&entity=CaseType/).respond({});
    $httpBackend.whenGET(/action=get&debug=true&entity=contact/).respond({});
    $httpBackend.whenGET(/action=get&debug=true&entity=Task/).respond({});
  };

  describe('AppSettingsService', function () {
    var AppSettings, AppSettingsService, $httpBackend, promise;

    beforeEach(module('civitasks.appDashboard'));

    beforeEach(inject(function (_AppSettingsService_, _AppSettings_, _$httpBackend_) {
      AppSettingsService = _AppSettingsService_;
      AppSettings = _AppSettings_;
      $httpBackend = _$httpBackend_;
    }));

    beforeEach(function () {
      mockBackendCalls($httpBackend);
      $httpBackend.whenGET(/action=get&debug=true&entity=Setting/).respond(settingsMock.onGet);
      spyOn(AppSettings, 'get').and.callThrough();

      promise = AppSettingsService.get(['maxFileSize']);
    });

    afterEach(function () {
      $httpBackend.flush();
    });

    describe('get()', function () {
      it('calls AppSettings get() to get maxFileSize values', function () {
        expect(AppSettings.get).toHaveBeenCalledWith({ sequential: 1, debug: true, return: [ 'maxFileSize' ] }, jasmine.any(Function), jasmine.any(Function));
      });

      it('returns the maxFileSize value', function () {
        promise.then(function (maxFileSize) {
          expect(maxFileSize).toEqual(settingsMock.onGet.values);
        });
      });
    });
  });
});
