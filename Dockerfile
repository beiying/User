FROM beiying/node
ENV REFRESHED_AT 2017-09-22

ADD ../User /data/work
WORKDIR /data/work
RUN git clone https://github.com/beiying/Core.git
npm install
