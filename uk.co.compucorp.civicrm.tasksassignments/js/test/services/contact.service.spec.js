/* eslint-env amd, jasmine */

define([
  'common/lodash',
  'mocks/data/contact.data',
  'tasks-assignments/modules/tasks-assignments.dashboard.module'
], function (_, contactMock) {
  'use strict';

  var mockBackendCalls = function ($httpBackend) {
    $httpBackend.whenGET(/views.*/).respond({});
    $httpBackend.whenGET(/action=getoptions&debug=true&entity=Task/).respond({});
    $httpBackend.whenGET(/action=getoptions&debug=true&entity=Document/).respond({});
    $httpBackend.whenGET(/action=get&entity=CaseType/).respond({});
    $httpBackend.whenGET(/action=get&debug=true&entity=Task/).respond({});
  };

  describe('contactService', function () {
    var Contact, contactService, $httpBackend, promise, jsonData;

    beforeEach(module('tasks-assignments.dashboard'));

    beforeEach(inject(function (_Contact_, _contactService_, _$httpBackend_) {
      contactService = _contactService_;
      Contact = _Contact_;
      $httpBackend = _$httpBackend_;

      jsonData = {
        json: {
          id: { IN: [1, 2, 3, 5, 6, 7] },
          return: 'display_name, sort_name, id, contact_id, contact_type, email'
        }
      };
    }));

    beforeEach(function () {
      mockBackendCalls($httpBackend);
      $httpBackend.whenGET(/action=get&debug=true&entity=contact/).respond(contactMock.onGetContacts);
      spyOn(Contact, 'get').and.callThrough();

      promise = contactService.get({ IN: [1, 2, 3, 5, 6, 7, 2, 3, 6] });
    });

    afterEach(function () {
      $httpBackend.flush();
    });

    describe('get()', function () {
      it('calls Contact get() with unique contact ids to get respective contacts', function () {
        expect(Contact.get).toHaveBeenCalledWith(jsonData, jasmine.any(Function), jasmine.any(Function));
      });

      it('returns the contact details for requested contact ids', function () {
        promise.then(function (contactsData) {
          expect(contactsData).toEqual(contactMock.onGetContacts.values);
        });
      });
    });
  });
});
