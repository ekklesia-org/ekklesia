export default {
  displayName: 'users',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/api/users',
  moduleNameMapper: {
    '^@ekklesia/database/(.*)$': '<rootDir>/../../database/src/$1',
  },
};
