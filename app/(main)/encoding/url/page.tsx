'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useEncoding } from '@/hooks/useEncoding';
import { Globe } from 'lucide-react';
// --- 수정: useState와 useEffect를 추가로 import ---
import { useEffect, useState } from 'react';
// --- 수정: Checkbox 컴포넌트 import (UI 라이브러리에 없으므로 임시로 사용) ---
// 실제로는 shadcn/ui에서 Checkbox를 추가해서 사용하는 것이 좋습니다.
// npm install @radix-ui/react-checkbox
// npx shadcn-ui@latest add checkbox

export default function UrlTool() {
  // --- 수정: 실시간 변환 상태 추가 ---
  const [isRealtime, setIsRealtime] = useState(true);

  const {
    input,
    setInput,
    output,
    mode,
    setMode,
    handleEncode,
    handleDecode,
    handleClear,
    handleCopy,
  } = useEncoding({
    encodeFn: encodeURIComponent,
    decodeFn: decodeURIComponent,
  });

  // --- 수정: 실시간 변환을 위한 useEffect 추가 ---
  useEffect(() => {
    if (isRealtime) {
      if (mode === 'encode') {
        handleEncode();
      } else {
        handleDecode();
      }
    }
  }, [input, mode, isRealtime, handleEncode, handleDecode]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#FF980020' }}>
          <Globe className="w-6 h-6" style={{ color: '#FF9800' }} />
        </div>
        <h1 className="text-3xl font-bold">URL 인코더/디코더</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="space-x-2">
                <Button
                  variant={mode === 'encode' ? 'default' : 'outline'}
                  onClick={() => setMode('encode')}>
                  인코딩
                </Button>
                <Button
                  variant={mode === 'decode' ? 'default' : 'outline'}
                  onClick={() => setMode('decode')}>
                  디코딩
                </Button>
              </div>
              <Button variant="outline" onClick={handleClear}>
                초기화
              </Button>
            </div>
            <Textarea
              placeholder={
                mode === 'encode'
                  ? 'URL 인코딩할 텍스트를 입력하세요...'
                  : 'URL 디코딩할 문자열을 입력하세요...'
              }
              value={input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setInput(e.target.value)
              }
              className="min-h-[200px] mb-4 font-mono"
            />

            {/* --- 수정: 실시간 변환 체크박스와 변환 버튼 UI --- */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <input
                  id="realtime-checkbox"
                  type="checkbox"
                  checked={isRealtime}
                  onChange={(e) => setIsRealtime(e.target.checked)}
                  className="h-4 w-4"
                />
                <label
                  htmlFor="realtime-checkbox"
                  className="text-sm font-medium">
                  실시간 변환
                </label>
              </div>
              {!isRealtime && (
                <Button
                  onClick={mode === 'encode' ? handleEncode : handleDecode}>
                  {mode === 'encode' ? '인코딩' : '디코딩'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">결과</h2>
              <Button variant="outline" onClick={handleCopy}>
                복사
              </Button>
            </div>
            <Textarea
              value={output}
              readOnly
              className="min-h-[200px] font-mono"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
