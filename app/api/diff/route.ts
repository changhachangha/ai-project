import { NextRequest, NextResponse } from 'next/server';
import { processDiff } from '@/lib/tools/diff';
import { DiffToolInput } from '@/lib/types/tools';

export async function POST(req: NextRequest) {
    try {
        const { originalText, newText, diffType } = await req.json();

        if (typeof originalText !== 'string' || typeof newText !== 'string') {
            return NextResponse.json(
                { error: 'Invalid input: originalText and newText must be strings.' },
                { status: 400 }
            );
        }

        if (!['chars', 'words', 'lines'].includes(diffType)) {
            return NextResponse.json(
                { error: "Invalid diffType. Must be 'chars', 'words', or 'lines'." },
                { status: 400 }
            );
        }

        const input: DiffToolInput = { originalText, newText };
        const result = processDiff(input, diffType);

        return NextResponse.json(result);
    } catch (error: unknown) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An unknown error occurred during diff processing.' },
            { status: 500 }
        );
    }
}
