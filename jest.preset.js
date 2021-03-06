const nxPreset = require('@nrwl/jest/preset');
module.exports = {
  ...nxPreset,
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$',
      astTransformers: {
        before: [
          'jest-preset-angular/build/InlineFilesTransformer',
          'jest-preset-angular/build/StripStylesTransformer',
        ],
      },
    },
  },
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!@ngxs|simple-git)'],
  moduleFileExtensions: ['ts', 'html', 'js', 'json'],
  resolver: '@nrwl/jest/plugins/resolver',
  coverageReporters: ['html'],
  collectCoverage: true,
  cacheDirectory: '/tmp/jest_rs/nx-ng-starter',
};
