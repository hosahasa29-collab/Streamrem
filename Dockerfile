FROM node:18

RUN apt update && apt install -y ffmpeg

WORKDIR /app
COPY . .

CMD ["node", "index.js"]