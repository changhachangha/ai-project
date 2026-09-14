#!/usr/bin/env node
/**
 * 번들 분석 빌드 실행기.
 *
 * `ANALYZE=true next build` 는 POSIX 셸 전용 문법이라 Windows(cmd)에서 실패한다.
 * 환경변수를 코드로 주입한 뒤 next build 를 호출해 OS에 무관하게 동작시킨다.
 */
const { spawnSync } = require('node:child_process');

const result = spawnSync('npx', ['next', 'build'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, ANALYZE: 'true' },
});

process.exit(result.status ?? 1);
