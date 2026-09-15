import { toASCII, toUnicode } from 'punycode';

export interface PunycodeOutput {
    text: string;
    errorMessage?: string;
}

// IDN 도메인 변환: '한국.com' ↔ 'xn--3e0b707e.com'
// toASCII/toUnicode 가 라벨별 xn-- 접두사를 알아서 처리한다.
export const encodePunycode = (input: string): PunycodeOutput => {
    try {
        return { text: toASCII(input) };
    } catch (error: unknown) {
        return {
            text: '',
            errorMessage: error instanceof Error ? error.message : '인코딩 중 오류가 발생했습니다.',
        };
    }
};

export const decodePunycode = (input: string): PunycodeOutput => {
    try {
        return { text: toUnicode(input) };
    } catch (error: unknown) {
        return {
            text: '',
            errorMessage: error instanceof Error ? error.message : '유효하지 않은 Punycode 형식입니다.',
        };
    }
};
