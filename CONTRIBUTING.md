# Contributing to MEASUR (AMO-Tools-Desktop)

## Quicklinks

* [Code of Conduct](#code-of-conduct)
* [Getting Started](#getting-started)
    * [Issues](#issues)
    * [Branching Conventions](#issues)
    * [Pull Requests](#pull-requests)
* [Coding Style](#coding-style)
* [Release Process](#release-process)
* [Versioning](#versioning)
* [Getting Help](#getting-help)

## Code of Conduct

We take our open source community seriously and hold ourselves and other contributors to high standards of communication. By participating and contributing to this project, you agree to uphold our [Code of Conduct](CODE_OF_CONDUCT.md)

## Getting Started

We would love for you to contribute to MEASUR (AMO-Tools-Desktop) and help make it even better than it is today!

Reading and following these guidelines will help us make the contribution process easy and effective for everyone involved. It also communicates that you agree to respect the time of the product team as well as the developers managing and developing this open source projects. In return, we will reciprocate that respect by addressing your issue, assessing changes, and helping you finalize your pull requests.


Contributions are made to this repo via Issues and Pull Requests (PRs).

If you've never contributed before, see the following for help:
- https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project
- https://github.com/firstcontributions/first-contributions

### Issues

We are not accepting new contributor-created issues at this time. Issues that are eligible for community contribution will be marked with the `help wanted` label.

Before starting work on an issue:
1. Comment on the issue saying you'd like to work on it
2. Wait for a maintainer to assign it to you 
3. Only begin work after assignment
4. If you're assigned but can't complete it, comment to let us know so we can reassign

Please do not add information or comments to existing issues other than those regarding assignment specified above. If you require additional information related to an in-progress issue you are assigned to, open a draft PR and the development team will respond. 

If you encounter a bug or have reproduction information related to an existing issue, please contact [measur-help@ornl.gov](measur-help@ornl.gov).


### Branching Conventions

This repository uses the following branch conventions:

- master: Stable release version
- develop: Development branch which contains the newest features and issues will be tracked in the latest release milestone. Code may be unstable as issues work through the QA phase.
- issue-xxx[-description]: Feature or bug fix branch from develop, should reference a github issue number. You may provide an optional short description in the branch name.
- fix-xxx[-description]: Bug fix branch from develop, should reference a github issue number. You may provide an optional short description in the branch name.
- epic-xxx[-description]: In some cases, a large feature will be broken down into a subset of issues. Will the large feature is developed, the small issues can't be added to develop without the totality of the epic being finished. Use an epic branch to create incremental pull requests of smaller issues into the larger epic feature.

### Pull Requests

Pull requests to MEASUR are always welcome. We work hard to makes sure PRs are handled in a timely manner. As we are a small development team, we cannot promise a review or response within a specific timeline.

PRs should:

- Only fix or add the functionality in question.
- Address a single concern with a focus on readability and the minimum amount of implementation as possible
- Use a hashtag to connect the issue number it satisfies 
- Avoid merge commits in your PR branch; instead, use rebase or cherry-pick to keep the commit history clean.
- Follow best practices for code style:
    - [CODING_STYLE_GUIDE](CODING_STYLE_GUIDE.md)

#### Pre-PR Checklist
Before creating a pull request, please review your code using this checklist:

- [ ] The code builds and runs locally without errors or warnings
- [ ] Only relevant files are included in the PR (no debug, temp, or unrelated changes)
- [ ] Variable, function, and class names are descriptive and clear
- [ ] UI changes have been manually tested for usability and appearance
- [ ] For open source contributors: The PR description clearly explains the purpose and scope of the changes
- [ ] For development team members: The related issue is updated to explain the purpose and scope of the changes
- [ ] The PR references the related issue number (if applicable)


#### Please follow the "fork-and-pull" Git workflow

Fork and pull process for contributors:

1. Fork the repository to your own Github account
2. Clone the project to your machine
3. Create a branch locally with a succinct but descriptive name
4. Commit changes to the branch
5. Following any formatting and testing guidelines specific to this repo
6. Push changes to your fork
7. Open a PR in our repository and follow the PR template so that we can efficiently review the changes.


#### More Information:
[Git Hub - Creating a pull request from a fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork).
[Atlassian - Forking Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/forking-workflow).

## Coding Style

MEASUR specific style and pattern guidelines can be found in the [CODING_STYLE_GUIDE](CODING_STYLE_GUIDE.md)

Above all else, contributors should do their best to follow the conventions of modern Angular, React, Typescript, and Javascript versions.


## Release Process

Releases are managed by the core development team. An "Epic" issue and a Milestone are used to track the issues going into the next release of MEASUR. Our QA team will test issues via the project board. When QA has been completed on the full set of "Epic" issues develop is merged into main and a release will be drafted by the CI system. Release notes are compiled from the changelog entries in PRs. Version numbers follow semantic versioning. Only core maintainers should publish releases.

## Versioning

MEASUR uses [semantic verisoning 2.0.0](https://semver.org/spec/v2.0.0.html). An example version specification for MEASUR looks like `0.0.1-alpha`. Core developers will be responsible for version numbers and releases.

The following is reproduced from semver.org:
```
Given a version number MAJOR.MINOR.PATCH, increment the:

MAJOR version when you make incompatible API changes
MINOR version when you add functionality in a backward compatible manner
PATCH version when you make backward compatible bug fixes
Additional labels for pre-release and build metadata are available as extensions to the MAJOR.MINOR.PATCH format.
```

## Getting Help
The MEASUR development team cannot provide technical guidance beyond PR review

If you are a MEASUR user and need assistance with application workflow, bug reporting, or require other assistance, please contact [measur-help@ornl.gov](measur-help@ornl.gov).



