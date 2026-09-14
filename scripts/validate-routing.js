#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 라우팅 설정 검증 스크립트
 *
 * 카테고리-경로 매핑의 단일 진실 공급원(single source of truth)인
 * `lib/utils/routing.ts` 를 직접 파싱해 사용하므로, 매핑을 중복 정의하지 않는다.
 * (이전에는 이 파일에 매핑이 복사되어 있어 실제 매핑과 어긋나는 문제가 있었다.)
 */

const ROOT = process.cwd();
const ROUTING_FILE = path.join(ROOT, 'lib/utils/routing.ts');
const DATA_DIR = path.join(ROOT, 'app/data');
const MAIN_DIR = path.join(ROOT, 'app/(main)');

function fail(message) {
    console.error(`💥 ${message}`);
    process.exit(1);
}

/** lib/utils/routing.ts 에서 카테고리-경로 매핑을 파싱한다. */
function loadCategoryMappings() {
    if (!fs.existsSync(ROUTING_FILE)) {
        fail(`매핑 파일을 찾을 수 없습니다: ${ROUTING_FILE}`);
    }

    const content = fs.readFileSync(ROUTING_FILE, 'utf8');
    const mappings = [];
    const pattern = /category:\s*['"]([^'"]+)['"]\s*,\s*path:\s*['"]([^'"]+)['"]/g;
    let match;

    while ((match = pattern.exec(content)) !== null) {
        mappings.push({ category: match[1], path: match[2] });
    }

    if (mappings.length === 0) {
        fail('lib/utils/routing.ts 에서 카테고리 매핑을 파싱하지 못했습니다.');
    }

    return mappings;
}

/** app/data/*-tools.ts 파일에서 도구(id, category)를 추출한다. */
function loadTools() {
    if (!fs.existsSync(DATA_DIR)) {
        fail(`데이터 디렉토리를 찾을 수 없습니다: ${DATA_DIR}`);
    }

    const files = fs.readdirSync(DATA_DIR).filter((file) => file.endsWith('-tools.ts'));
    const tools = [];

    files.forEach((file) => {
        const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
        const idMatches = content.match(/id:\s*['"]([^'"]+)['"]/g) || [];
        const categoryMatches = content.match(/category:\s*['"]([^'"]+)['"]/g) || [];

        if (idMatches.length !== categoryMatches.length) {
            fail(
                `${file}: id(${idMatches.length}개)와 category(${categoryMatches.length}개) 개수가 일치하지 않습니다.`
            );
        }

        idMatches.forEach((rawId, index) => {
            const id = rawId.match(/['"]([^'"]+)['"]/)[1];
            const category = categoryMatches[index].match(/['"]([^'"]+)['"]/)[1];
            tools.push({ id, category, file });
        });
    });

    return tools;
}

function checkDuplicateIds(tools) {
    const errors = [];
    const seen = new Map();

    tools.forEach((tool) => {
        if (seen.has(tool.id)) {
            errors.push(`❌ 중복된 도구 id: "${tool.id}" (${seen.get(tool.id)}, ${tool.file})`);
        } else {
            seen.set(tool.id, tool.file);
        }
    });

    return errors;
}

function checkCategoryMappings(tools, mappings) {
    const errors = [];
    const mappedCategories = mappings.map((m) => m.category);

    [...new Set(tools.map((t) => t.category))].forEach((category) => {
        if (!mappedCategories.includes(category)) {
            errors.push(`❌ 매핑되지 않은 카테고리: "${category}" — lib/utils/routing.ts 에 추가하세요.`);
        }
    });

    return errors;
}

function getPathForCategory(category, mappings) {
    const mapping = mappings.find((m) => m.category === category);
    return mapping ? mapping.path : null;
}

function checkDirectoryStructure(tools, mappings) {
    const errors = [];
    const expectedPaths = new Set(mappings.map((m) => m.path));

    tools.forEach((tool) => {
        const expectedPath = getPathForCategory(tool.category, mappings);

        // 카테고리 매핑 오류로 이미 보고되므로 여기서는 건너뛴다.
        if (!expectedPath) return;

        if (!expectedPaths.has(expectedPath)) {
            errors.push(
                `❌ 매핑된 경로에 대응하는 폴더가 없습니다: "${expectedPath}" (카테고리: ${tool.category})`
            );
            return;
        }

        const toolDir = path.join(MAIN_DIR, expectedPath, tool.id);
        const pageFile = path.join(toolDir, 'page.tsx');

        if (!fs.existsSync(toolDir)) {
            errors.push(`❌ 디렉토리 누락: app/(main)/${expectedPath}/${tool.id}`);
        } else if (!fs.existsSync(pageFile)) {
            errors.push(`❌ page.tsx 누락: app/(main)/${expectedPath}/${tool.id}/page.tsx`);
        }
    });

    return errors;
}

function main() {
    console.log('🔍 라우팅 설정 검증 시작...\n');

    const mappings = loadCategoryMappings();
    const tools = loadTools();

    console.log(`📊 카테고리 매핑 ${mappings.length}개 / 도구 ${tools.length}개 발견\n`);

    const errors = [
        ...checkDuplicateIds(tools),
        ...checkCategoryMappings(tools, mappings),
        ...checkDirectoryStructure(tools, mappings),
    ];

    if (errors.length === 0) {
        console.log(`🎉 모든 라우팅 설정이 올바릅니다! (도구 ${tools.length}개)`);
        process.exit(0);
    }

    console.log('🚨 라우팅 오류:');
    errors.forEach((error) => console.log(error));
    console.log(`\n❌ 총 ${errors.length}개의 오류가 발견되었습니다.`);
    console.log('\n💡 해결 방법:');
    console.log('1. lib/utils/routing.ts 의 CATEGORY_PATH_MAPPINGS 확인');
    console.log('2. 누락된 디렉토리/page.tsx 생성');
    console.log('3. docs/새로운-도구-추가-체크리스트.md 참조');
    process.exit(1);
}

main();
