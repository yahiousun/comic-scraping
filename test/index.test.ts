import { scrape } from '../src';

const url = 'http://manhua.dmzj.com/yishichuangshenglu/45117.shtml#@page=1';

describe('scrape website', function() {
  it('parse comic post', function(done) {
    scrape(url).then((result) => {
      done();
    });
  });

  it('reject if not available', function(done) {
    scrape('http://www.baidu.com/').then(() => {
    }, () => {
      done();
    });
  });
});
