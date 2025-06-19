import { EncodeToolInput, EncodeToolOutput, DecodeToolInput, DecodeToolOutput } from '@/lib/types/tools';

// Function to encode a Unicode string to Base64
const base64EncodeUnicode = (str: string): string => {
    // First, encode the string to UTF-8 bytes
    const utf8Bytes = new TextEncoder().encode(str);
    // Convert the Uint8Array to a binary string suitable for btoa
    const binaryString = String.fromCharCode(...utf8Bytes);
    // Encode the binary string to Base64
    return btoa(binaryString);
};

// Function to decode a Base64 string to Unicode
const base64DecodeUnicode = (base64: string): string => {
    // Decode the Base64 string to a binary string
    const binaryString = atob(base64);
    // Convert the binary string to a Uint8Array
    const utf8Bytes = Uint8Array.from(binaryString, (m) => m.codePointAt(0)!);
    // Decode the Uint8Array to a Unicode string
    return new TextDecoder().decode(utf8Bytes);
};

export const processEncode = (input: EncodeToolInput): EncodeToolOutput => {
    try {
        let encodedText = '';
        switch (input.encodingType) {
            case 'base64':
                encodedText = base64EncodeUnicode(input.text);
                break;
            case 'url':
                encodedText = encodeURIComponent(input.text);
                break;
            case 'html':
                encodedText = input.text
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
                break;
            default:
                encodedText = input.text;
        }
        return { encodedText };
    } catch (error: unknown) {
        return { encodedText: '', errorMessage: error instanceof Error ? error.message : 'Encoding error.' };
    }
};

export const processDecode = (input: DecodeToolInput): DecodeToolOutput => {
    try {
        let decodedText = '';
        switch (input.encodingType) {
            case 'base64':
                decodedText = base64DecodeUnicode(input.text);
                break;
            case 'url':
                decodedText = decodeURIComponent(input.text);
                break;
            case 'html':
                const doc = new DOMParser().parseFromString(input.text, 'text/html');
                decodedText = doc.documentElement.textContent || '';
                break;
            default:
                decodedText = input.text;
        }
        return { decodedText };
    } catch (error: unknown) {
        return { decodedText: '', errorMessage: error instanceof Error ? error.message : 'Decoding error.' };
    }
};
