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

# --------------------------------------------------------------------------------------------

# Install nvm, node and npm
#RUN touch ~/.bash_profile
#RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
# replace shell with bash so we can source files
#RUN rm /bin/sh && ln -s /bin/bash /bin/sh
#RUN source ~/.nvm/nvm.sh \ nvm --version
#RUN export NVM_DIR="$HOME/.nvm"
#RUN [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
#RUN [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
#RUN nvm --version



# replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# update the repository sources list
# and install dependencies
RUN apt-get update \
    && apt-get install -y curl \
    && apt-get -y autoclean

# nvm environment variables
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 12.8.0

# install nvm
# https://github.com/creationix/nvm#install-script
RUN curl --silent -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.2/install.sh | bash

# install node and npm
RUN source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

# add node and npm to path so the commands are available
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# confirm installation
RUN node -v
RUN npm -v
# ---------------------------------------------------------------------------------------------


# ---------------------------------------------------------------------------------------------
# This section is currently inactive

# Install node.js and npm (https://github.com/nodesource/distributions/blob/master/README.md)
#RUN nvm install node
#RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
#RUN apt-get install -y nodejs
#RUN node --version
#RUN npm --version

# Install npm
#RUN apt -y install npm
#RUN npm --version
# ---------------------------------------------------------------------------------------------

# Install gyp
RUN npm install -g node-gyp@4.0.0
RUN node-gyp -v

# Install Angular
RUN npm install -g @angular/cli@^8.0.0
RUN npm install --save-dev @angular/cli@^8.0.0
RUN ng --version

# Add AMO-Tools-Desktop
RUN mkdir AMO
RUN mkdir AMO/AMO-Tools-Desktop
# Inside AMO-Tools-Desktop directory
ADD . /home/AMO/AMO-Tools-Desktop/


#RUN touch package.json
WORKDIR /home/AMO/AMO-Tools-Desktop/

# Install Node Tap (test suite)
# @12.6.0, --save-dev
RUN npm install tap@12.6.0 --save-dev
#RUN apt -y install node-tap
#RUN tap --version

WORKDIR /home/

# Install emacs
RUN apt-get -y install emacs
RUN emacs --version


# Commands to run for building/testing/running AMO-Tools-Desktop
# -------------------------------------------------------------
WORKDIR /home/AMO/AMO-Tools-Desktop

#RUN npm run clean
#RUN npm install
#RUN node-gyp rebuild
#RUN npm run build
#RUN npm run electron

#--------------------------------------------------------------

WORKDIR /home/
