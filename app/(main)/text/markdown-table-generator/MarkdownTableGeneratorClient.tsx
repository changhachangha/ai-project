'use client';

import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Grid3X3, Plus, Minus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type Alignment = 'left' | 'center' | 'right';

interface TableData {
    headers: string[];
    rows: string[][];
    alignments: Alignment[];
}

const MarkdownTableGeneratorClient = memo(() => {
    const [tableData, setTableData] = useState<TableData>({
        headers: ['헤더1', '헤더2', '헤더3'],
        rows: [
            ['데이터1', '데이터2', '데이터3'],
            ['데이터4', '데이터5', '데이터6'],
        ],
        alignments: ['left', 'center', 'right'],
    });
    const [markdownOutput, setMarkdownOutput] = useState('');

    const generateMarkdown = useCallback(() => {
        const { headers, rows, alignments } = tableData;

        if (headers.length === 0) return '';

        // 헤더 행
        const headerRow = '| ' + headers.join(' | ') + ' |';

        // 정렬 행
        const alignmentRow =
            '| ' +
            alignments
                .map((align) => {
                    switch (align) {
                        case 'left':
                            return ':---';
                        case 'center':
                            return ':---:';
                        case 'right':
                            return '---:';
                        default:
                            return '---';
                    }
                })
                .join(' | ') +
            ' |';

        // 데이터 행들
        const dataRows = rows.map((row) => {
            const paddedRow = [...row];
            while (paddedRow.length < headers.length) {
                paddedRow.push('');
            }
            return '| ' + paddedRow.slice(0, headers.length).join(' | ') + ' |';
        });

        const markdown = [headerRow, alignmentRow, ...dataRows].join('\n');
        setMarkdownOutput(markdown);
        return markdown;
    }, [tableData]);

    const handleHeaderChange = useCallback((index: number, value: string) => {
        setTableData((prev) => ({
            ...prev,
            headers: prev.headers.map((h, i) => (i === index ? value : h)),
        }));
    }, []);

    const handleCellChange = useCallback((rowIndex: number, colIndex: number, value: string) => {
        setTableData((prev) => ({
            ...prev,
            rows: prev.rows.map((row, rIndex) =>
                rIndex === rowIndex ? row.map((cell, cIndex) => (cIndex === colIndex ? value : cell)) : row
            ),
        }));
    }, []);

    const handleAlignmentChange = useCallback((index: number, alignment: Alignment) => {
        setTableData((prev) => ({
            ...prev,
            alignments: prev.alignments.map((a, i) => (i === index ? alignment : a)),
        }));
    }, []);

    const addColumn = useCallback(() => {
        setTableData((prev) => ({
            headers: [...prev.headers, `헤더${prev.headers.length + 1}`],
            rows: prev.rows.map((row) => [...row, '']),
            alignments: [...prev.alignments, 'left'],
        }));
    }, []);

    const removeColumn = useCallback(
        (index: number) => {
            if (tableData.headers.length <= 1) return;

            setTableData((prev) => ({
                headers: prev.headers.filter((_, i) => i !== index),
                rows: prev.rows.map((row) => row.filter((_, i) => i !== index)),
                alignments: prev.alignments.filter((_, i) => i !== index),
            }));
        },
        [tableData.headers.length]
    );

    const addRow = useCallback(() => {
        setTableData((prev) => ({
            ...prev,
            rows: [...prev.rows, new Array(prev.headers.length).fill('')],
        }));
    }, []);

    const removeRow = useCallback(
        (index: number) => {
            if (tableData.rows.length <= 1) return;

            setTableData((prev) => ({
                ...prev,
                rows: prev.rows.filter((_, i) => i !== index),
            }));
        },
        [tableData.rows.length]
    );

    const handleCopy = useCallback(() => {
        const markdown = generateMarkdown();
        navigator.clipboard.writeText(markdown).then(() => {
            toast.success('마크다운 테이블이 클립보드에 복사되었습니다!');
        });
    }, [generateMarkdown]);

    const loadSample = useCallback(() => {
        setTableData({
            headers: ['이름', '나이', '직업', '도시'],
            rows: [
                ['홍길동', '30', '개발자', '서울'],
                ['김철수', '25', '디자이너', '부산'],
                ['이영희', '28', '기획자', '대구'],
            ],
            alignments: ['left', 'center', 'left', 'center'],
        });
    }, []);

    // 실시간 마크다운 생성
    useState(() => {
        generateMarkdown();
    });

    return (
        <div className='container mx-auto p-4 max-w-6xl'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <Grid3X3 className='h-8 w-8' />
                    마크다운 테이블 생성기
                </h1>
                <p className='text-muted-foreground mt-2'>시각적으로 마크다운 테이블을 생성하고 편집하세요.</p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* 테이블 편집기 */}
                <Card>
                    <CardHeader>
                        <div className='flex items-center justify-between'>
                            <CardTitle className='text-lg'>테이블 편집기</CardTitle>
                            <div className='flex gap-2'>
                                <Button onClick={addColumn} size='sm' variant='outline'>
                                    <Plus className='h-4 w-4 mr-1' />열 추가
                                </Button>
                                <Button onClick={addRow} size='sm' variant='outline'>
                                    <Plus className='h-4 w-4 mr-1' />행 추가
                                </Button>
                                <Button onClick={loadSample} size='sm' variant='outline'>
                                    샘플 로드
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            {/* 헤더 편집 */}
                            <div className='space-y-2'>
                                <h3 className='font-semibold'>헤더</h3>
                                <div
                                    className='grid gap-2'
                                    style={{ gridTemplateColumns: `repeat(${tableData.headers.length}, 1fr) auto` }}
                                >
                                    {tableData.headers.map((header, index) => (
                                        <div key={index} className='space-y-1'>
                                            <Input
                                                value={header}
                                                onChange={(e) => handleHeaderChange(index, e.target.value)}
                                                placeholder={`헤더 ${index + 1}`}
                                            />
                                            <Select
                                                value={tableData.alignments[index]}
                                                onValueChange={(value: Alignment) =>
                                                    handleAlignmentChange(index, value)
                                                }
                                            >
                                                <SelectTrigger className='h-8'>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='left'>왼쪽</SelectItem>
                                                    <SelectItem value='center'>가운데</SelectItem>
                                                    <SelectItem value='right'>오른쪽</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ))}
                                    <div className='flex flex-col gap-1'>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            onClick={() => removeColumn(tableData.headers.length - 1)}
                                            disabled={tableData.headers.length <= 1}
                                        >
                                            <Minus className='h-4 w-4' />
                                        </Button>
                                        <div className='h-8' />
                                    </div>
                                </div>
                            </div>

                            {/* 데이터 행 편집 */}
                            <div className='space-y-2'>
                                <h3 className='font-semibold'>데이터</h3>
                                <div className='space-y-2'>
                                    {tableData.rows.map((row, rowIndex) => (
                                        <div
                                            key={rowIndex}
                                            className='grid gap-2'
                                            style={{
                                                gridTemplateColumns: `repeat(${tableData.headers.length}, 1fr) auto`,
                                            }}
                                        >
                                            {tableData.headers.map((_, colIndex) => (
                                                <Input
                                                    key={colIndex}
                                                    value={row[colIndex] || ''}
                                                    onChange={(e) =>
                                                        handleCellChange(rowIndex, colIndex, e.target.value)
                                                    }
                                                    placeholder={`데이터 ${rowIndex + 1}-${colIndex + 1}`}
                                                />
                                            ))}
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() => removeRow(rowIndex)}
                                                disabled={tableData.rows.length <= 1}
                                            >
                                                <Trash2 className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 마크다운 출력 */}
                <Card>
                    <CardHeader>
                        <div className='flex items-center justify-between'>
                            <CardTitle className='text-lg'>마크다운 출력</CardTitle>
                            <Button variant='outline' size='sm' onClick={handleCopy} disabled={!markdownOutput}>
                                <Copy className='h-4 w-4 mr-1' />
                                복사
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            <Textarea
                                value={generateMarkdown()}
                                readOnly
                                placeholder='생성된 마크다운 테이블이 여기에 표시됩니다...'
                                className='min-h-[400px] font-mono text-sm'
                            />

                            {/* 미리보기 */}
                            <div className='p-4 bg-muted rounded-lg'>
                                <h3 className='font-semibold mb-2'>미리보기</h3>
                                <div className='overflow-x-auto'>
                                    <table className='min-w-full border-collapse border border-gray-300'>
                                        <thead>
                                            <tr className='bg-gray-50'>
                                                {tableData.headers.map((header, index) => (
                                                    <th
                                                        key={index}
                                                        className={`border border-gray-300 px-4 py-2 text-${tableData.alignments[index] === 'center' ? 'center' : tableData.alignments[index] === 'right' ? 'right' : 'left'}`}
                                                    >
                                                        {header}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tableData.rows.map((row, rowIndex) => (
                                                <tr key={rowIndex}>
                                                    {tableData.headers.map((_, colIndex) => (
                                                        <td
                                                            key={colIndex}
                                                            className={`border border-gray-300 px-4 py-2 text-${tableData.alignments[colIndex] === 'center' ? 'center' : tableData.alignments[colIndex] === 'right' ? 'right' : 'left'}`}
                                                        >
                                                            {row[colIndex] || ''}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className='mt-6 bg-muted/50'>
                <CardHeader>
                    <CardTitle className='text-sm'>사용 방법</CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground space-y-2'>
                    <p>
                        • <strong>헤더 편집:</strong> 테이블의 헤더와 정렬 방식을 설정
                    </p>
                    <p>
                        • <strong>데이터 입력:</strong> 각 셀에 데이터를 입력
                    </p>
                    <p>
                        • <strong>열/행 추가:</strong> 필요에 따라 열과 행을 추가/제거
                    </p>
                    <p>
                        • <strong>실시간 미리보기:</strong> 편집 중인 테이블을 실시간으로 확인
                    </p>
                    <p>
                        • <strong>마크다운 복사:</strong> 생성된 마크다운 코드를 클립보드에 복사
                    </p>
                </CardContent>
            </Card>
        </div>
    );
});

MarkdownTableGeneratorClient.displayName = 'MarkdownTableGeneratorClient';

export default MarkdownTableGeneratorClient;
