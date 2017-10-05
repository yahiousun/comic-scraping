import plugin from '../src/extensions/manhua.dmzj.com';

const url = 'http://manhua.dmzj.com/yishichuangshenglu/45117.shtml#@page=1';

describe('plugin manhua.dmzj.com', function() {
  it('parse comic post', function(done) {
    plugin.scrape(url).then((result) => {
      done();
    });
  });

  it('reject if not support', function(done) {
    plugin.scrape('url').then(() => {
    }, () => {
      done();
    });
  });

  it('reject if empty', function(done) {
    plugin.parse('').then(() => {
    }, () => {
      done();
    });
  });
});
