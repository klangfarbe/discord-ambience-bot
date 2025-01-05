FROM node:22
WORKDIR /app/
CMD node dist/index.cjs

RUN apt update && apt install --yes ffmpeg

COPY *.json /app/
RUN mkdir -p /app/src
RUN npm install --force

COPY src /app/src
RUN npm run build