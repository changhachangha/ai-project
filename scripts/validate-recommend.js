#!/usr/bin/env node
/**
 * 추천 데이터 정합성 검증 스크립트
 *
 * 검사 항목
 *  1. 모든 도구에 tags 가 있고 비어 있지 않은지
 *  2. 태그 형식(공백만/빈 문자열)과 도구 내 중복
 *  3. related 에 적힌 id 가 실제로 존재하는지 (오타 방지)
 *  4. related 에 자기 자신이 들어 있지 않은지
 *  5. related 역방향 선언 여부는 참고 수치로만 집계
 *
 * 추천 결과가 조용히 비어 버리는 상황을 배포 전에 잡는 것이 목적이다.
 * (related 오타는 런타임에 "추천 0개"로만 나타나 원인 파악이 어렵다)
 *
 * related 는 방향을 따지지 않는다. 추천 로직이 단방향 선언을 양방향으로
 * 확장해 읽으므로(규칙 계층의 buildRelatedMap), A→B 만 적어도 B→A 가 성립한다.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'app', 'data');
const DATA_FILES = ['encoding', 'conversion', 'text', 'security', 'developer'];

const errors = [];


function readTools(file) {
    const source = fs.readFileSync(path.join(DATA_DIR, `${file}-tools.ts`), 'utf8');
    const tools = [];
    const entryPattern = /\{\s*id:\s*'([^']+)',[\s\S]*?\n\s*\}/g;

    for (const match of source.matchAll(entryPattern)) {
        const block = match[0];
        const id = match[1];
        const name = /name:\s*'([^']*)'/.exec(block)?.[1] ?? '';
        const category = /category:\s*'([^']*)'/.exec(block)?.[1] ?? '';
        const tagsRaw = /tags:\s*\[([^\]]*)\]/.exec(block)?.[1];
        const relatedRaw = /related:\s*\[([^\]]*)\]/.exec(block)?.[1];

        const parseList = (raw) =>
            raw === undefined
                ? null
                : raw
                      .split(',')
                      .map((item) => item.trim().replace(/^'|'$/g, ''))
                      .filter((item) => item.length > 0);

        tools.push({
            id,
            name,
            category,
            tags: parseList(tagsRaw),
            related: parseList(relatedRaw),
        });
    }

    return tools;
}

const allTools = DATA_FILES.flatMap(readTools);
const byId = new Map(allTools.map((tool) => [tool.id, tool]));

if (allTools.length === 0) {
    errors.push('도구를 하나도 읽지 못했습니다. 파싱 패턴을 확인하세요.');
}

const seenIds = new Set();

for (const tool of allTools) {
    if (seenIds.has(tool.id)) {
        errors.push(`중복된 도구 id: ${tool.id}`);
    }
    seenIds.add(tool.id);

    if (tool.tags === null) {
        errors.push(`${tool.id}: tags 가 없습니다.`);
    } else if (tool.tags.length === 0) {
        errors.push(`${tool.id}: tags 가 비어 있습니다.`);
    } else {
        if (new Set(tool.tags).size !== tool.tags.length) {
            errors.push(`${tool.id}: tags 에 중복이 있습니다.`);
        }
        if (tool.tags.some((tag) => tag.trim() !== tag)) {
            errors.push(`${tool.id}: tags 앞뒤에 공백이 있습니다.`);
        }
    }

    if (tool.related) {
        if (new Set(tool.related).size !== tool.related.length) {
            errors.push(`${tool.id}: related 에 중복이 있습니다.`);
        }
        if (tool.related.includes(tool.id)) {
            errors.push(`${tool.id}: related 에 자기 자신이 포함되어 있습니다.`);
        }
        for (const relatedId of tool.related) {
            if (!byId.has(relatedId)) {
                errors.push(`${tool.id}: related 의 '${relatedId}' 는 존재하지 않는 도구입니다.`);
            }
        }
    }
}

// 단방향 related 는 오류가 아니다. 추천 로직이 양방향으로 확장해 읽으므로
// 개별 경고 대신 참고 수치만 집계한다.
let oneWayCount = 0;
for (const tool of allTools) {
    for (const relatedId of tool.related ?? []) {
        const target = byId.get(relatedId);
        if (target && !(target.related ?? []).includes(tool.id)) {
            oneWayCount += 1;
        }
    }
}

const taggedCount = allTools.filter((tool) => (tool.tags ?? []).length > 0).length;
const relatedCount = allTools.filter((tool) => (tool.related ?? []).length > 0).length;

console.log(`도구 ${allTools.length}개 · 태그 보유 ${taggedCount}개 · related 보유 ${relatedCount}개`);
console.log(`related 선언 ${oneWayCount}건은 단방향 (추천 시 양방향으로 확장됨)`);

if (errors.length > 0) {
    console.error(`\n오류 ${errors.length}건`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
}

console.log('\n추천 데이터 검증 통과');
