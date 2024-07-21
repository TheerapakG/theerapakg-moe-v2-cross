FROM node:22

RUN apt update
RUN apt install -y libargon2-1

COPY ./.output ./.output

CMD [ "node", ".output/server/index.mjs" ]