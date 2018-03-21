# указываю версию ноды, на которой вел разработку
FROM node:8.9.4

ENV PORT=9000
ENV REPO_PATH=/app
# 
RUN npm config set proxy http://konstantinov:1474560@vm-squid.rosenergo.com:3128
RUN npm config set https-proxy http://konstantinov:1474560@vm-squid.rosenergo.com:3128
# 
RUN git clone https://github.com/konstantinov90/shri_2018_nodejs_homework.git ${REPO_PATH}
WORKDIR ${REPO_PATH}

RUN npm install
EXPOSE ${PORT}

RUN chmod 777 ./startup.sh
CMD ./startup.sh && npm run dev