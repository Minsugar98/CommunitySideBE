FROM node:20-alpine
WORKDIR /app

# PM2 전역 설치
RUN npm install -g pm2

# 의존성 설치 및 Prisma 관련 파일 복사
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# 소스 복사 및 빌드
COPY . .
RUN npx prisma generate
RUN npm run build

# 4000번 포트 개방
EXPOSE 3001

# Prisma 마이그레이션 실행 후 PM2로 앱 구동
# -- (더블 대시) 이후에 오는 인자는 npm run start:prod에 전달됩니다.
ENTRYPOINT npx prisma migrate deploy && pm2-runtime start npm --name "nest-api" -- run start:prod
