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

export function validateHashFormat(hash: string, algorithm: string): boolean {
    if (!hash) return false;

    // 일반적인 해시 길이 검증
    const expectedLengths: Record<string, number[]> = {
        md5: [32], // HEX
        sha1: [40], // HEX
        sha256: [64], // HEX
        sha512: [128], // HEX
    };

    const lengths = expectedLengths[algorithm.toLowerCase()];
    if (!lengths) return false;

    // HEX 형식 검증
    const hexPattern = /^[a-fA-F0-9]+$/;
    if (hexPattern.test(hash) && lengths.includes(hash.length)) {
        return true;
    }

    // Base64 형식 검증 (대략적인 길이 체크)
    const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
    if (base64Pattern.test(hash)) {
        return true;
    }

    return false;
}

export function generateSampleText(): string {
    return 'Hello, World! This is a sample text for hashing.';
}
