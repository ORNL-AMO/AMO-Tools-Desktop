#!/bin/bash

if [[ "$TRAVIS_OS_NAME" == "linux" ]]
then
    export OS_NAME="linux"
elif [[ "$TRAVIS_OS_NAME" == "osx" ]]
then
    export OS_NAME="mac"
elif [[ "$TRAVIS_OS_NAME" == "windows" ]]
then
    export OS_NAME="windows"
fi
