import { EvalWorker } from '../src/eval-worker';

describe('eval-worker', function() {
  const sandbox = new EvalWorker();

  it('eval a string', function(done) {
    sandbox.eval('5+3').then((result) => {
      expect(result).toBe(8);
      done();
    });
  });

  it('should throw a SyntaxError', function(done) {
    sandbox.eval('5+3\/').catch((err) => {
      done();
    });
  });

  it('should clear callbacks', function(done) {
    sandbox.terminate();
    expect(sandbox.callbacks.size).toBe(0);
    done();
  });

  it('should throw a error', function(done) {
    sandbox.eval('5+3').catch((err) => {
      done();
    });
  });
});
