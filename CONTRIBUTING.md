# Contributing

Thanks for being willing to contribute!

**Working on your first Pull Request?** You can learn how from this _free_
series [How to Contribute to an Open Source Project on GitHub][egghead]

## Project setup

1. Fork and clone the repo
2. Run `npm run setup -s` to install dependencies and run validation
3. Create a branch for your PR with `git checkout -b pr/your-branch-name`

> Tip: Keep your `master` branch pointing at the original repository and make
> pull requests from branches on your fork. To do this, run:
>
> ```
> git remote add upstream https://github.com/yolk-hq/next-utils.git
> git fetch upstream
> git branch --set-upstream-to=upstream/master master
> ```
>
> This will add the original repository as a "remote" called "upstream," Then
> fetch the git information from that remote, then set your local `master`
> branch to use the upstream master branch whenever you run `git pull`. Then you
> can make all of your pull request branches based on this `master` branch.
> Whenever you want to update your version of `master`, do a regular `git pull`.

## Committing and Pushing changes

Please make sure to run the tests before you commit your changes.

## Running Tests

Once you have dependencies installed, `npm install`, you can run the tests with `npm run test`.

## Help needed

Please checkout the [the open issues][issues]

Also, please watch the repo and respond to questions/bug reports/feature
requests! Thanks!

[egghead]: https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github
[issues]: https://github.com/yolk-hq/next-utils/issues

## Releases

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) which releases automatically when code is merged to master.

[Your commit message specifies the release.](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular#angular-convention)
