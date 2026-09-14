import * as forge from 'node-forge';
import { extractPublicKey } from '@/lib/tools/crypto';

describe('lib/tools/crypto', () => {
    it('빈 개인키는 에러 메시지를 반환한다', () => {
        const result = extractPublicKey(
            { privateKey: '   ', keyFormat: 'pem' },
            { outputFormat: 'pem', keyType: 'auto' }
        );
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe('개인키를 입력해주세요.');
    });

    it('PEM 형식이 아니면 파싱 실패 메시지를 반환한다', () => {
        const result = extractPublicKey(
            { privateKey: 'not-a-pem-key', keyFormat: 'pem' },
            { outputFormat: 'pem', keyType: 'auto' }
        );
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toContain('PEM 형식의 개인키를 입력해주세요.');
    });

    describe('RSA 개인키 처리', () => {
        let privateKeyPem: string;

        beforeAll(() => {
            // 테스트 속도를 위해 512비트 키를 사용한다 (실서비스 키가 아님)
            const keyPair = forge.pki.rsa.generateKeyPair({ bits: 512 });
            privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);
        });

        it('PEM 개인키에서 공개키를 추출한다', () => {
            const result = extractPublicKey(
                { privateKey: privateKeyPem, keyFormat: 'pem' },
                { outputFormat: 'pem', keyType: 'auto' }
            );
            expect(result.isValid).toBe(true);
            expect(result.keyInfo.keyType).toBe('rsa');
            expect(result.keyInfo.keySize).toBe(512);
            expect(result.publicKey).toContain('-----BEGIN PUBLIC KEY-----');
        });

        it('hex 출력 형식을 지원한다', () => {
            const result = extractPublicKey(
                { privateKey: privateKeyPem, keyFormat: 'pem' },
                { outputFormat: 'hex', keyType: 'rsa' }
            );
            expect(result.isValid).toBe(true);
            expect(result.publicKey).toMatch(/^[0-9a-f]+$/);
        });

        it('jwk 출력 형식은 kty=RSA 를 포함한다', () => {
            const result = extractPublicKey(
                { privateKey: privateKeyPem, keyFormat: 'pem' },
                { outputFormat: 'jwk', keyType: 'rsa' }
            );
            expect(JSON.parse(result.publicKey).kty).toBe('RSA');
        });
    });
});
