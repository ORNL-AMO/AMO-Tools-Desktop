---
name: Release Epic
about: Represents next release group
title: '[MEASUR NEXT]: vx.x.x'
labels: 'Epic'

---


## Release Checklist
- [ ] Follow the [release process](https://github.com/ORNL-AMO/AMO-Tools-Desktop/blob/develop/docs/release-process.md)
- [ ] Requires a suite release
- [ ] Previous patch releases have been synced to `develop`
- [ ] Approved release version is prepared in root `package.json` and `package-lock.json`
- [ ] Previous release tag and successful production run are confirmed; promotion uses Create a merge commit
- [ ] All installers are built/signed, macOS is notarized, and the complete draft release exists
- [ ] Production web deployment waited for the desktop gate; deployed version and behavior are verified
- [ ] Installers launch on supported platforms, including Intel and Apple Silicon Macs
- [ ] Draft installers and release notes are reviewed and the release is published by a maintainer

**Delivery Date**
Do we have a requested delivery date? If so, how flexible is the deadline?

**Overview and Notes**
Context related to release, dependencies, blockers, etc

**Events, In-plants, and Trainings**
Events and dates where requested features will be used 


