export interface JsonToolInput {
    jsonString: string;
}

export interface JsonToolOptions {
    indentation: number | 'tab';
    minify: boolean;
    sortKeys: boolean;
}

export interface JsonToolOutput {
    formattedJson: string;
    isValid: boolean;
    errorMessage?: string;
}

export interface EncodeToolInput {
    text: string;
    encodingType: 'base64' | 'url' | 'html';
}

export interface EncodeToolOutput {
    encodedText: string;
    errorMessage?: string;
}

export interface DecodeToolInput {
    text: string;
    encodingType: 'base64' | 'url' | 'html';
}

export interface DecodeToolOutput {
    decodedText: string;
    errorMessage?: string;
}

export interface TimestampToolInput {
    timestamp: number | string; // Unix timestamp or date string
}

export interface TimestampToolOptions {
    format: string; // e.g., 'YYYY-MM-DD HH:mm:ss'
    timezone: string; // e.g., 'Asia/Seoul'
}

export interface TimestampToolOutput {
    humanReadableDate: string;
    unixTimestamp: number;
    errorMessage?: string;
}

export interface ColorToolInput {
    color: string; // e.g., '#FF0000', 'rgb(255,0,0)', 'hsl(0,100%,50%)'
}

export interface ColorToolOutput {
    hex: string;
    rgb: string;
    hsl: string;
    errorMessage?: string;
}

export interface DiffToolInput {
    originalText: string;
    newText: string;
}

export interface DiffToolOutput {
    diffResult: string; // e.g., a unified diff format
    errorMessage?: string;
}

export interface CryptoToolInput {
    privateKey: string;
    keyFormat: 'pem' | 'pkcs8' | 'auto';
}

export interface CryptoToolOptions {
    outputFormat: 'pem' | 'der' | 'jwk' | 'hex';
    keyType: 'rsa' | 'ecdsa' | 'auto';
}

export interface CryptoToolOutput {
    publicKey: string;
    keyInfo: {
        keyType: string;
        keySize?: number;
    };
    isValid: boolean;
    errorMessage?: string;
}

export interface HashToolInput {
    text: string;
    algorithm: 'sha256' | 'sha512' | 'md5' | 'sha1';
}

export interface HashToolOptions {
    outputFormat: 'hex' | 'base64';
    compareHash?: string; // 검증할 해시값
}

export interface HashToolOutput {
    hash: string;
    algorithm: string;
    outputFormat: string;
    isValid: boolean;
    isMatch?: boolean; // 해시 검증 결과
    errorMessage?: string;
}
