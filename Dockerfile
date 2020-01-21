FROM ubuntu:18.04

WORKDIR /home/

RUN apt -y update
RUN apt -y upgrade

# Install gcc
RUN apt -y install build-essential
RUN apt-get -y install manpages-dev
RUN gcc --version

# Install Python
RUN apt-get -y install python
RUN python --version

# Install curl
RUN apt -y install curl

# Install cmake
RUN apt -y install cmake
RUN cmake --version

# Install ccmake
RUN apt -y install cmake-curses-gui
RUN ccmake --version

# Install Doxygen
RUN apt -y install doxygen
RUN doxygen --version

# Install nvm
#RUN touch ~/.bash_profile
#RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
#RUN source ~/.nvm/nvm.sh
#RUN nvm --version

# Install node.js and npm (https://github.com/nodesource/distributions/blob/master/README.md)
#RUN nvm install node
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install -y nodejs
RUN node --version
RUN npm --version

# Install npm
#RUN apt -y install npm
#RUN npm --version

# Install gyp
RUN npm install -g node-gyp@4.0.0
RUN node-gyp -v


# Add AMO-Tools-Suite
RUN mkdir AMO
RUN mkdir AMO/AMO-Tools-Suite
# Inside AMO-Tools-Suite directory
ADD . /home/AMO/AMO-Tools-Suite/


#RUN touch package.json
WORKDIR /home/AMO/AMO-Tools-Suite/

# Install Node Tap (test suite)
# @12.6.0, --save-dev
RUN npm install tap@12.6.0 --save-dev
#RUN apt -y install node-tap
#RUN tap --version

WORKDIR /home/

# Install emacs
RUN apt-get -y install emacs
RUN emacs --version


# Commands to run for building/testing/running AMO-Tools-Suite
# -------------------------------------------------------------
WORKDIR /home/AMO/AMO-Tools-Suite/

RUN cmake -D BUILD_TESTING:BOOL=ON -D BUILD_PACKAGE:BOOL=OFF --config Debug ./

RUN cmake --build .

RUN ./bin/amo_tools_suite_tests

RUN npm install

RUN node-gyp rebuild

RUN npm run test

RUN npm run at
#--------------------------------------------------------------

WORKDIR /home/
