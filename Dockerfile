# указываю версию ноды, на которой вел разработку
FROM node:8.9.4

ENV PORT=9000
ENV TARGET_REPO=https://github.com/konstantinov90/shri_2018_nodejs_homework.git

RUN git --version
RUN wget https://mirrors.edge.kernel.org/pub/software/scm/git/git-2.9.5.tar.gz
RUN tar -zxf git-2.9.5.tar.gz
WORKDIR /git-2.9.5
RUN make prefix=/usr/local all
RUN make prefix=/usr/local install
RUN git --version

RUN mkdir /app
RUN mkdir /target

WORKDIR /app
COPY . .

RUN npm install --only=production
EXPOSE ${PORT}

CMD echo express.port=${PORT} > app.properties && \
    echo repository.directory=/target >> app.properties && \
    git clone ${TARGET_REPO} /target && \
    cd /target && \
    git branch --list -a | grep remotes | grep -v "remotes/origin/HEAD" | cut -d"/" -f 3 | awk '{print "git checkout " $0}' | bash && \
    git checkout master && \
    cd /app && \
    npm start