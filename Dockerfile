# указываю версию ноды, на которой вел разработку
FROM node:8.9.4

ENV PORT=9000
ENV TARGET_REPO=https://github.com/konstantinov90/shri_2018_css_homework.git

RUN mkdir /app
RUN mkdir /target
# 
# 
WORKDIR /app
COPY . .

RUN npm install
EXPOSE ${PORT}

CMD echo express.port=${PORT} > app.properties && \
    echo repository.directory=/target >> app.properties && \
    git clone ${TARGET_REPO} /target && \
    npm run dev