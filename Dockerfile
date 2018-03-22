# указываю версию ноды, на которой вел разработку
FROM node:8.9.4

ENV PORT=9000
ENV REPO_PATH=/app
# 
# 
RUN git clone https://github.com/konstantinov90/shri_2018_nodejs_homework.git ${REPO_PATH}
WORKDIR ${REPO_PATH}

RUN npm install
EXPOSE ${PORT}

RUN chmod 777 ./startup.sh
# RUN chmod 777 ./docker_push.sh
CMD ./startup.sh && npm run dev