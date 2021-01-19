module.exports = {
    collectCoverage: true,
    collectCoverageFrom: [
        "*.js",
        "!jest.config.js",
        "!.eslintrc.js",
    ],
    coverageReporters: [
        'json-summary',
        'text',
        'lcov',
    ]
};
