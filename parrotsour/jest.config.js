module.exports = {
    transform: {'^.+\\.(ts|js|jsx|tsx)?$': 'ts-jest'},
    testEnvironment: 'node',
    testRegex: '/__tests__/.*\\.(test|spec)?\\.(ts|tsx)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleDirectories: ['node_modules', 'src'],
    setupFiles: ["jest-canvas-mock", "./setupTests.js" ],
    testURL: "http://localhost/",
    verbose:"true"
};