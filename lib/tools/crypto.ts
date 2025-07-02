import * as forge from 'node-forge';
import { CryptoToolInput, CryptoToolOptions, CryptoToolOutput } from '@/lib/types/tools';

export function extractPublicKey(input: CryptoToolInput, options: CryptoToolOptions): CryptoToolOutput {
    try {
        const { privateKey } = input;
        const { outputFormat } = options;

        if (!privateKey.trim()) {
            return {
                publicKey: '',
                keyInfo: { keyType: 'unknown' },
                isValid: false,
                errorMessage: '개인키를 입력해주세요.',
            };
        }

        // 개인키 파싱 시도
        let privateKeyObj: forge.pki.PrivateKey;
        let detectedKeyType: string;

        try {
            // PEM 형식으로 시도
            if (privateKey.includes('-----BEGIN')) {
                if (privateKey.includes('RSA PRIVATE KEY')) {
                    privateKeyObj = forge.pki.privateKeyFromPem(privateKey);
                    detectedKeyType = 'rsa';
                } else if (privateKey.includes('PRIVATE KEY')) {
                    // PKCS#8 형식
                    privateKeyObj = forge.pki.privateKeyFromPem(privateKey);
                    detectedKeyType = 'rsa'; // forge는 주로 RSA를 지원
                } else if (privateKey.includes('EC PRIVATE KEY')) {
                    // EC 개인키는 forge에서 제한적 지원
                    throw new Error('ECDSA 키는 현재 지원되지 않습니다. RSA 키를 사용해주세요.');
                } else {
                    throw new Error('지원되지 않는 개인키 형식입니다.');
                }
            } else {
                throw new Error('PEM 형식의 개인키를 입력해주세요.');
            }
        } catch (parseError) {
            return {
                publicKey: '',
                keyInfo: { keyType: 'unknown' },
                isValid: false,
                errorMessage: `개인키 파싱 실패: ${
                    parseError instanceof Error ? parseError.message : '알 수 없는 오류'
                }`,
            };
        }

        // 공개키 추출
        const rsaPrivateKey = privateKeyObj as forge.pki.rsa.PrivateKey;
        const publicKeyObj = forge.pki.rsa.setPublicKey(rsaPrivateKey.n, rsaPrivateKey.e);

        // 키 정보 수집
        const keyInfo = {
            keyType: detectedKeyType,
            keySize: detectedKeyType === 'rsa' ? rsaPrivateKey.n.bitLength() : undefined,
        };

        // 출력 형식에 따른 공개키 변환
        let publicKeyOutput: string;

        switch (outputFormat) {
            case 'pem':
                publicKeyOutput = forge.pki.publicKeyToPem(publicKeyObj);
                break;
            case 'der':
                const derBytes = forge.asn1.toDer(forge.pki.publicKeyToAsn1(publicKeyObj)).getBytes();
                publicKeyOutput = forge.util.encode64(derBytes);
                break;
            case 'jwk':
                // JWK 형식 (간단한 구현)
                const rsaPublicKey = publicKeyObj as forge.pki.rsa.PublicKey;
                const jwk = {
                    kty: 'RSA',
                    n: forge.util.encode64(rsaPublicKey.n.toString(16)),
                    e: forge.util.encode64(rsaPublicKey.e.toString(16)),
                };
                publicKeyOutput = JSON.stringify(jwk, null, 2);
                break;
            case 'hex':
                const hexBytes = forge.asn1.toDer(forge.pki.publicKeyToAsn1(publicKeyObj)).getBytes();
                publicKeyOutput = forge.util.bytesToHex(hexBytes);
                break;
            default:
                publicKeyOutput = forge.pki.publicKeyToPem(publicKeyObj);
        }

        return {
            publicKey: publicKeyOutput,
            keyInfo,
            isValid: true,
        };
    } catch (error) {
        return {
            publicKey: '',
            keyInfo: { keyType: 'unknown' },
            isValid: false,
            errorMessage: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        };
    }
}

// 샘플 RSA 개인키 생성 함수 (테스트용)
export function generateSampleRSAKey(): string {
    try {
        const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
        return forge.pki.privateKeyToPem(keyPair.privateKey);
    } catch {
        return '';
    }
}
