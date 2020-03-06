#!/bin/bash

set -ev

if [[ $TRAVIS_BRANCH == 'master' ]]; then
  travis_wait 30 npm run ng-high-memory;
  ./node_modules/.bin/build -"$OS_FLAG" --x64 --publish="never";
  ls;
  ls ../output/;
else
  cd missing_folder
  npm run build;
fi

exit 0;
