import CryptoJS from 'crypto-js';
import { HashToolInput, HashToolOptions, HashToolOutput } from '@/lib/types/tools';

export function generateHash(input: HashToolInput, options: HashToolOptions): HashToolOutput {
    try {
        if (!input.text.trim()) {
            return {
                hash: '',
                algorithm: input.algorithm,
                outputFormat: options.outputFormat,
                isValid: false,
                errorMessage: '입력 텍스트가 비어있습니다.',
            };
        }

        let hash: CryptoJS.lib.WordArray;

        // 알고리즘에 따른 해시 생성
        switch (input.algorithm) {
            case 'sha256':
                hash = CryptoJS.SHA256(input.text);
                break;
            case 'sha512':
                hash = CryptoJS.SHA512(input.text);
                break;
            case 'md5':
                hash = CryptoJS.MD5(input.text);
                break;
            case 'sha1':
                hash = CryptoJS.SHA1(input.text);
                break;
            default:
                return {
                    hash: '',
                    algorithm: input.algorithm,
                    outputFormat: options.outputFormat,
                    isValid: false,
                    errorMessage: '지원하지 않는 해시 알고리즘입니다.',
                };
        }

        // 출력 형식에 따른 변환
        let hashString: string;
        switch (options.outputFormat) {
            case 'hex':
                hashString = hash.toString(CryptoJS.enc.Hex);
                break;
            case 'base64':
                hashString = hash.toString(CryptoJS.enc.Base64);
                break;
            default:
                hashString = hash.toString(CryptoJS.enc.Hex);
        }

        // 해시 검증 (선택사항)
        let isMatch: boolean | undefined;
        if (options.compareHash) {
            const compareHashNormalized = options.compareHash.toLowerCase().trim();
            const generatedHashNormalized = hashString.toLowerCase().trim();
            isMatch = compareHashNormalized === generatedHashNormalized;
        }

        return {
            hash: hashString,
            algorithm: input.algorithm.toUpperCase(),
            outputFormat: options.outputFormat.toUpperCase(),
            isValid: true,
            isMatch,
        };
    } catch (error) {
        return {
            hash: '',
            algorithm: input.algorithm,
            outputFormat: options.outputFormat,
            isValid: false,
            errorMessage: error instanceof Error ? error.message : '해시 생성 중 오류가 발생했습니다.',
        };
    }
}

/**
 * 알고리즘별 기대 길이 (문자 수).
 * base64 는 바이트 수 → base64 문자열 길이(패딩 포함)로 환산한 값이다.
 */
const HASH_SPECS: Record<string, { hex: number; base64: number }> = {
    md5: { hex: 32, base64: 24 }, // 16 bytes
    sha1: { hex: 40, base64: 28 }, // 20 bytes
    sha256: { hex: 64, base64: 44 }, // 32 bytes
    sha512: { hex: 128, base64: 88 }, // 64 bytes
};

export function validateHashFormat(hash: string, algorithm: string): boolean {
    const value = hash.trim();
    if (!value) return false;

    const spec = HASH_SPECS[algorithm.toLowerCase()];
    if (!spec) return false;

    // HEX 형식 + 길이 검증
    if (/^[a-fA-F0-9]+$/.test(value) && value.length === spec.hex) {
        return true;
    }

    // Base64 형식 + 길이 검증
    // (이전 구현은 base64 패턴만 확인해서 아무 짧은 문자열이나 통과시켰다.)
    if (/^[A-Za-z0-9+/]+={0,2}$/.test(value) && value.length === spec.base64) {
        return true;
    }

    return false;
}

export function generateSampleText(): string {
    return 'Hello, World! This is a sample text for hashing.';
}
