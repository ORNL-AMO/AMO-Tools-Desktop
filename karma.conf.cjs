const { join } = require('node:path');
const { writeFileSync } = require('node:fs');

if (!process.env.CHROME_BIN) {
  process.env.CHROME_BIN = require('puppeteer').executablePath();
}

module.exports = function (config) {
  const captureCompressedAirSnapshot = Boolean(process.env.CA_REGRESSION_TEST_OUTPUT);
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('karma-spec-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
      { 'reporter:ca-snapshot': ['type', CompressedAirRegressionTestSnapshotReporter] }
    ],
    client: {
      clearContext: false,
      args: captureCompressedAirSnapshot
        ? [
            'ca-capture',
            process.env.CA_REGRESSION_TEST_SCOPE === 'full' ? 'ca-scope-full' : 'ca-scope-core',
            `ca-baseline=${process.env.CA_REGRESSION_TEST_BASELINE || 'pre-pr409-suite-1.2.5'}`,
          ]
        : []
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    coverageReporter: {
      dir: join(__dirname, './coverage/amo-tools-desktop'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }]
    },
    reporters: captureCompressedAirSnapshot ? ['spec', 'ca-snapshot'] : ['spec', 'kjhtml'],
    specReporter: {
      maxLogLines: 5,
      suppressErrorSummary: false,
      suppressFailed: false,
      suppressPassed: false,
      suppressSkipped: true,
      showSpecTiming: false,
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
      }
    },
    captureTimeout: 120000,
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 60000,
    singleRun: false,
    restartOnFileChange: true
  });
};

function CompressedAirRegressionTestSnapshotReporter(baseReporterDecorator) {
  baseReporterDecorator(this);
  const chunks = [];
  let expectedChunks;

  this.onBrowserInfo = (_browser, info) => {
    if (!info.caSnapshotChunk) return;
    const { index, total, data } = info.caSnapshotChunk;
    expectedChunks = total;
    chunks[index] = data;
  };

  this.onRunComplete = () => {
    if (!process.env.CA_REGRESSION_TEST_OUTPUT) return;
    if (!expectedChunks || chunks.filter(Boolean).length !== expectedChunks) {
      throw new Error(`Compressed-air snapshot capture was incomplete (${chunks.filter(Boolean).length}/${expectedChunks ?? 0} chunks).`);
    }
    const json = Buffer.from(chunks.join(''), 'base64').toString('utf8');
    JSON.parse(json);
    writeFileSync(process.env.CA_REGRESSION_TEST_OUTPUT, `${json}\n`);
  };
}

CompressedAirRegressionTestSnapshotReporter.$inject = ['baseReporterDecorator'];
