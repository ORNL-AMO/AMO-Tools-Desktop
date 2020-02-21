#!/bin/bash

if [[ "$TRAVIS_OS_NAME" == "linux" ]]
then
    export OS_FLAG="l"
elif [[ "$TRAVIS_OS_NAME" == "osx" ]]
then
    export OS_FLAG="m"
elif [[ "$TRAVIS_OS_NAME" == "windows" ]]
then
    export OS_FLAG="w"
fi
