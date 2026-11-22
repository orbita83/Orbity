module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|standard-navigation)',
  ],
  // O Jest usa a primeira regra que casar: a específica de assets precisa vir antes da genérica.
  moduleNameMapper: {
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  clearMocks: true,
  // O primeiro teste de cada arquivo de tela monta a tela inteira pela primeira vez e, no runner do
  // CI, pode passar dos 5 s padrão do Jest sem nenhuma falha real (ex.: tasks-content.test.tsx).
  testTimeout: 15000,
  globalSetup: '<rootDir>/tests/setup/timezone.cjs',
};
