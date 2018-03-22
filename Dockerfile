# указываю версию ноды, на которой вел разработку
FROM node:8.9.4

ENV PORT=9000
ENV TARGET_REPO=https://github.com/konstantinov90/shri_2018_css_homework.git

RUN npm config set proxy http://konstantinov:1474560@vm-squid.rosenergo.com:3128

RUN npm config set https-proxy http://konstantinov:1474560@vm-squid.rosenergo.com:3128

RUN mkdir /app
RUN mkdir /target
RUN git clone ${TARGET_REPO} /target
# 
# 
WORKDIR /app
COPY . .


RUN npm install
EXPOSE ${PORT}

RUN chmod 777 ./startup.sh
# RUN chmod 777 ./docker_push.sh
CMD ./startup.sh && npm run dev