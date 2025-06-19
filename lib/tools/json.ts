import { JsonToolInput, JsonToolOptions, JsonToolOutput } from '@/lib/types/tools';

type JsonValue = string | number | boolean | null | JSONObject | JSONArray;
interface JSONObject {
    [key: string]: JsonValue;
}
type JSONArray = JsonValue[];

const sortObjectKeysRecursive = (obj: JsonValue): JsonValue => {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(sortObjectKeysRecursive) as JSONArray;
    }

    const sortedKeys = Object.keys(obj).sort();
    const newObj: JSONObject = {};
    for (const key of sortedKeys) {
        newObj[key] = sortObjectKeysRecursive((obj as JSONObject)[key]);
    }
    return newObj;
};

export const processJson = (input: JsonToolInput, options: JsonToolOptions): JsonToolOutput => {
    try {
        let parsed: JsonValue = JSON.parse(input.jsonString);

        if (options.sortKeys) {
            parsed = sortObjectKeysRecursive(parsed);
        }

        let formattedJson = '';

        if (options.minify) {
            formattedJson = JSON.stringify(parsed);
        } else {
            const space = options.indentation === 'tab' ? '\t' : options.indentation;
            formattedJson = JSON.stringify(parsed, null, space);
        }

        return { formattedJson, isValid: true };
    } catch (error: unknown) {
        return {
            formattedJson: '',
            isValid: false,
            errorMessage: error instanceof Error ? error.message : 'Invalid JSON format.',
        };
    }
};
