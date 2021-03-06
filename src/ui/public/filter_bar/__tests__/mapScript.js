
describe('Filter Bar Directive', function () {
  describe('mapScript()', function () {
    var sinon = require('auto-release-sinon');
    var expect = require('expect.js');
    var ngMock = require('ngMock');
    var mapScript;
    var $rootScope;

    beforeEach(ngMock.module(
      'kibana',
      'kibana/courier',
      function ($provide) {
        $provide.service('courier', require('fixtures/mock_courier'));
      }
    ));

    beforeEach(ngMock.inject(function (Private, _$rootScope_) {
      $rootScope = _$rootScope_;
      mapScript = Private(require('ui/filter_bar/lib/mapScript'));
    }));

    it('should return the key and value for matching filters', function (done) {
      var filter = {
        meta: { index: 'logstash-*', field: 'script number' },
        script: { script: 'doc["script number"].value * 5', params: { value: 35}}
      };
      mapScript(filter).then(function (result) {
        expect(result).to.have.property('key', 'script number');
        expect(result).to.have.property('value', '35');
        done();
      });
      $rootScope.$apply();
    });

    it('should return undefined for none matching', function (done) {
      var filter = { meta: { index: 'logstash-*' }, query: { query_string: { query: 'foo:bar' } } };
      mapScript(filter).catch(function (result) {
        expect(result).to.be(filter);
        done();
      });
      $rootScope.$apply();
    });

    it('should return a value for a range/histogram filter from a scripted field', (done) => {
      let filter = {
        meta: {
          index: 'logstash-*',
          formattedValue: '1,000.00 to 2,000.00',
          field: 'script number'
        },
        script: {
          params: {
            gte: 1000,
            lt: 2000,
            value: '>=1,000.00 <2,000.00'
          }
        }
      };
      mapScript(filter).then((result) => {
        expect(result).to.have.property('value', filter.meta.formattedValue);
        done();
      });
      $rootScope.$apply();
    });
  });
});
