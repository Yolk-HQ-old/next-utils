// https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md

module.exports = {
  branches: ['master', { name: 'fix-peer-deps', prerelease: true }],
};
