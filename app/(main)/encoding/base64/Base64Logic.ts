const encodeBase64 = (text: string): string => {
    return btoa(unescape(encodeURIComponent(text)));
};

const decodeBase64 = (base64: string): string => {
    return decodeURIComponent(escape(atob(base64)));
};

const handleFileChangeLogic = (
    event: React.ChangeEvent<HTMLInputElement>,
    setOutput: (value: string) => void,
    setInput: (value: string) => void,
    setMode: (mode: 'encode' | 'decode') => void
) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
            const base64Data = result.split(',')[1];
            setOutput(base64Data);
            setInput(`파일: ${file.name} (${Math.round(file.size / 1024)} KB)`);
            setMode('encode');
        }
    };
    reader.onerror = () => {
        setOutput('파일을 읽는 중 오류가 발생했습니다.');
    };
    reader.readAsDataURL(file);
};

export { encodeBase64, decodeBase64, handleFileChangeLogic };
