#!/bin/bash

set -ev

if [[ $TRAVIS_OS_NAME == 'windows' ]]; then
  echo "Skipping 'npm i -g npm@6.4.0' command on Windows"
else
  travis_retry npm i -g npm@6.4.0;
fi

exit 0;
