'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import { useState } from 'react';

const htmlEntities: { [key: string]: string } = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

export default function HtmlTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const handleEncode = () => {
    try {
      const encoded = input.replace(
        /[&<>"'`=\/]/g,
        (char) => htmlEntities[char]
      );
      setOutput(encoded);
    } catch (_error) {
      setOutput('인코딩 중 오류가 발생했습니다. 유효한 텍스트를 입력해주세요.');
    }
  };

  const handleDecode = () => {
    try {
      const textarea = document.createElement('textarea');
      textarea.innerHTML = input;
      const decoded = textarea.value;
      setOutput(decoded);
    } catch (_error) {
      setOutput(
        '디코딩 중 오류가 발생했습니다. 유효한 HTML 엔티티를 입력해주세요.'
      );
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#F4433620' }}>
          <FileText className="w-6 h-6" style={{ color: '#F44336' }} />
        </div>
        <h1 className="text-3xl font-bold">HTML 인코더/디코더</h1>
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
                  ? 'HTML 인코딩할 텍스트를 입력하세요...'
                  : 'HTML 디코딩할 문자열을 입력하세요...'
              }
              value={input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setInput(e.target.value)
              }
              className="min-h-[200px] mb-4 font-mono"
            />
            <Button
              className="w-full"
              onClick={mode === 'encode' ? handleEncode : handleDecode}>
              {mode === 'encode' ? '인코딩' : '디코딩'}
            </Button>
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
