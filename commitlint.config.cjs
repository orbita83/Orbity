const { prefixes } = require('./scripts/conventions.cjs');

module.exports = {
  defaultIgnores: false,
  plugins: [
    {
      rules: {
        'subject-starts-lowercase': ({ subject }) => [
          !subject || /^\p{Ll}/u.test(subject),
          'a descrição deve iniciar com letra minúscula',
        ],
      },
    },
  ],
  rules: {
    'type-enum': [2, 'always', prefixes],
    'type-empty': [2, 'never'],
    'scope-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-starts-lowercase': [2, 'always'],
  },
};
