#!/bin/bash

set -ev

if [[ $TRAVIS_BRANCH == 'master' ]]; then
  npm run ng-high-memory;
  ./node_modules/.bin/build -"$OS_FLAG" --x64 --publish="never";
  ls;
  ls output/;
else
  npm run build;
fi

exit 0;
