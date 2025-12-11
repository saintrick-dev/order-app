#!/bin/bash
# Render Static Site 빌드 스크립트
# 이 스크립트는 Render의 Build Command에서 사용됩니다.

echo "📦 프런트엔드 빌드 시작..."

# 의존성 설치
npm install

# 프로덕션 빌드
npm run build

echo "✅ 빌드 완료!"

