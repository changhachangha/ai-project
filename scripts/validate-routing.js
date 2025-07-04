#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 라우팅 설정 검증 스크립트
 * 새로운 도구 추가 시 라우팅 일관성을 자동으로 확인
 */

// 카테고리-경로 매핑 (routing.ts에서 복사)
const CATEGORY_PATH_MAPPINGS = [
    { category: '베이스 인코딩', path: 'encoding' },
    { category: 'URL/텍스트 처리', path: 'encoding' },
    { category: '진수 변환', path: 'encoding' },
    { category: '텍스트 처리', path: 'text' },
    { category: '보안/암호화', path: 'security' },
    { category: '시간/날짜', path: 'conversion' },
    { category: '색상', path: 'conversion' },
    { category: '유틸리티', path: 'conversion' },
];

function getPathForCategory(category) {
    const mapping = CATEGORY_PATH_MAPPINGS.find((m) => m.category === category);
    return mapping ? mapping.path : 'encoding';
}

function loadDataFiles() {
    const dataDir = path.join(process.cwd(), 'app/data');
    const files = ['encoding-tools.ts', 'text-tools.ts', 'security-tools.ts', 'conversion-tools.ts'];

    const allTools = [];

    files.forEach((file) => {
        const filePath = path.join(dataDir, file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            // 간단한 정규식으로 도구 정보 추출
            const toolMatches = content.match(/id:\s*['"]([^'"]+)['"]/g);
            const categoryMatches = content.match(/category:\s*['"]([^'"]+)['"]/g);

            if (toolMatches && categoryMatches) {
                for (let i = 0; i < toolMatches.length; i++) {
                    const id = toolMatches[i].match(/['"]([^'"]+)['"]/)[1];
                    const category = categoryMatches[i].match(/['"]([^'"]+)['"]/)[1];
                    allTools.push({ id, category, file });
                }
            }
        }
    });

    return allTools;
}

function checkDirectoryStructure(tools) {
    const errors = [];

    tools.forEach((tool) => {
        const expectedPath = getPathForCategory(tool.category);
        const toolDir = path.join(process.cwd(), 'app/(main)', expectedPath, tool.id);
        const pageFile = path.join(toolDir, 'page.tsx');

        if (!fs.existsSync(toolDir)) {
            errors.push(`❌ 디렉토리 누락: ${toolDir}`);
        } else if (!fs.existsSync(pageFile)) {
            errors.push(`❌ page.tsx 누락: ${pageFile}`);
        } else {
            console.log(`✅ ${tool.id}: 경로 및 파일 존재`);
        }
    });

    return errors;
}

function checkCategoryMappings(tools) {
    const errors = [];
    const usedCategories = [...new Set(tools.map((t) => t.category))];
    const mappedCategories = CATEGORY_PATH_MAPPINGS.map((m) => m.category);

    usedCategories.forEach((category) => {
        if (!mappedCategories.includes(category)) {
            errors.push(`❌ 매핑되지 않은 카테고리: "${category}"`);
        }
    });

    return errors;
}

function main() {
    console.log('🔍 라우팅 설정 검증 시작...\n');

    try {
        const tools = loadDataFiles();
        console.log(`📊 총 ${tools.length}개 도구 발견\n`);

        // 카테고리 매핑 검증
        const categoryErrors = checkCategoryMappings(tools);
        if (categoryErrors.length > 0) {
            console.log('🚨 카테고리 매핑 오류:');
            categoryErrors.forEach((error) => console.log(error));
            console.log();
        }

        // 디렉토리 구조 검증
        const structureErrors = checkDirectoryStructure(tools);
        if (structureErrors.length > 0) {
            console.log('🚨 디렉토리 구조 오류:');
            structureErrors.forEach((error) => console.log(error));
            console.log();
        }

        const totalErrors = categoryErrors.length + structureErrors.length;

        if (totalErrors === 0) {
            console.log('🎉 모든 라우팅 설정이 올바릅니다!');
            process.exit(0);
        } else {
            console.log(`❌ 총 ${totalErrors}개의 오류가 발견되었습니다.`);
            console.log('\n💡 해결 방법:');
            console.log('1. lib/utils/routing.ts의 CATEGORY_PATH_MAPPINGS 확인');
            console.log('2. 누락된 디렉토리/파일 생성');
            console.log('3. docs/새로운-도구-추가-체크리스트.md 참조');
            process.exit(1);
        }
    } catch (error) {
        console.error('💥 검증 중 오류 발생:', error.message);
        process.exit(1);
    }
}

main();
