import { generateHash, validateHashFormat, generateSampleText } from '@/lib/tools/hash';

describe('lib/tools/hash', () => {
    const hex = { outputFormat: 'hex' as const };

    describe('generateHash — 알려진 벡터 검증', () => {
        it('MD5("abc") 를 계산한다', () => {
            const result = generateHash({ text: 'abc', algorithm: 'md5' }, hex);
            expect(result.hash).toBe('900150983cd24fb0d6963f7d28e17f72');
            expect(result.isValid).toBe(true);
            expect(result.algorithm).toBe('MD5');
            expect(result.outputFormat).toBe('HEX');
        });

        it('SHA-1("abc") 를 계산한다', () => {
            const result = generateHash({ text: 'abc', algorithm: 'sha1' }, hex);
            expect(result.hash).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
        });

        it('SHA-256("abc") 를 계산한다', () => {
            const result = generateHash({ text: 'abc', algorithm: 'sha256' }, hex);
            expect(result.hash).toBe(
                'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
            );
        });

        it('SHA-512("abc") 를 계산한다 (128자)', () => {
            const result = generateHash({ text: 'abc', algorithm: 'sha512' }, hex);
            expect(result.hash).toBe(
                'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a' +
                    '2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f'
            );
        });

        it('base64 출력 형식을 지원한다 (hex 와 동일 바이트)', () => {
            const hexResult = generateHash({ text: 'abc', algorithm: 'md5' }, hex);
            const result = generateHash({ text: 'abc', algorithm: 'md5' }, { outputFormat: 'base64' });
            expect(Buffer.from(result.hash, 'base64').toString('hex')).toBe(hexResult.hash);
            expect(result.outputFormat).toBe('BASE64');
        });
    });

    describe('generateHash — 입력 검증', () => {
        it('빈 문자열은 isValid=false 와 에러 메시지를 반환한다', () => {
            const result = generateHash({ text: '   ', algorithm: 'sha256' }, hex);
            expect(result.isValid).toBe(false);
            expect(result.hash).toBe('');
            expect(result.errorMessage).toBe('입력 텍스트가 비어있습니다.');
        });
    });

    describe('generateHash — 해시 비교', () => {
        it('compareHash 가 일치하면 isMatch=true', () => {
            const result = generateHash(
                { text: 'abc', algorithm: 'md5' },
                { outputFormat: 'hex', compareHash: '900150983CD24FB0D6963F7D28E17F72' }
            );
            expect(result.isMatch).toBe(true);
        });

        it('compareHash 가 불일치하면 isMatch=false', () => {
            const result = generateHash(
                { text: 'abc', algorithm: 'md5' },
                { outputFormat: 'hex', compareHash: 'deadbeef' }
            );
            expect(result.isMatch).toBe(false);
        });
    });

    describe('validateHashFormat', () => {
        it('알고리즘별 올바른 HEX 길이를 통과시킨다', () => {
            expect(validateHashFormat('900150983cd24fb0d6963f7d28e17f72', 'md5')).toBe(true);
            expect(validateHashFormat('a9993e364706816aba3e25717850c26c9cd0d89d', 'sha1')).toBe(true);
            expect(
                validateHashFormat(
                    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
                    'sha256'
                )
            ).toBe(true);
        });

        it('길이가 맞지 않으면 false', () => {
            expect(validateHashFormat('abc', 'sha256')).toBe(false);
        });

        it('빈 값/미지원 알고리즘은 false', () => {
            expect(validateHashFormat('', 'md5')).toBe(false);
            expect(validateHashFormat('900150983cd24fb0d6963f7d28e17f72', 'unknown')).toBe(false);
        });
    });

    it('generateSampleText 는 비어있지 않은 문자열을 반환한다', () => {
        expect(generateSampleText().length).toBeGreaterThan(0);
    });
});
