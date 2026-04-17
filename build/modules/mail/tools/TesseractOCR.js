import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);
const OCR_MAX_BUFFER = 10 * 1024 * 1024;
const TESSERACT_PROFILES = [
    {
        name: 'general-block',
        args: [
            '-l', 'spa+eng',
            '--oem', '1',
            '--psm', '6',
            '-c', 'preserve_interword_spaces=1',
            '-c', 'user_defined_dpi=300',
        ],
    },
    {
        name: 'sparse-layout',
        args: [
            '-l', 'spa+eng',
            '--oem', '1',
            '--psm', '11',
            '-c', 'preserve_interword_spaces=1',
            '-c', 'user_defined_dpi=300',
        ],
    },
    {
        name: 'amount-focus',
        args: [
            '-l', 'spa+eng',
            '--oem', '1',
            '--psm', '11',
            '-c', 'preserve_interword_spaces=1',
            '-c', 'user_defined_dpi=300',
            '-c', 'tessedit_char_whitelist=0123456789.,$:-/ ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        ],
    },
];
function normalizeExtension(extension) {
    if (!extension) {
        return '.img';
    }
    return extension.startsWith('.') ? extension : `.${extension}`;
}
function normalizeLineForDedup(line) {
    return line
        .normalize('NFKC')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}
function collectUniqueLines(...chunks) {
    const seen = new Set();
    const lines = [];
    for (const chunk of chunks) {
        for (const rawLine of chunk.split('\n')) {
            const line = rawLine.trim();
            if (!line) {
                continue;
            }
            const fingerprint = normalizeLineForDedup(line);
            if (!fingerprint || seen.has(fingerprint)) {
                continue;
            }
            seen.add(fingerprint);
            lines.push(line);
        }
    }
    return lines.join('\n').trim();
}
function extractAmountLikeLines(text) {
    return text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => {
        if (!line) {
            return false;
        }
        const digitCount = (line.match(/\d/g) ?? []).length;
        const hasCurrency = /[$€£]|ars|usd|importe|monto|total/i.test(line);
        const hasAmountShape = /\d{1,3}(?:[.\s]\d{3})*(?:[.,]\d{2})|\d+[.,]\d{2}/.test(line);
        return hasCurrency || (hasAmountShape && digitCount >= 4);
    })
        .join('\n');
}
async function runTesseractProfile(filePath, profile) {
    const { stdout, stderr } = await execFileAsync('tesseract', [filePath, 'stdout', ...profile.args], { maxBuffer: OCR_MAX_BUFFER });
    if (stderr) {
        void stderr;
    }
    return stdout.trim();
}
export async function extractTextWithTesseract(input, extension) {
    let filePath = typeof input === 'string' ? input : '';
    let tempDir = '';
    try {
        if (Buffer.isBuffer(input)) {
            tempDir = await mkdtemp(join(tmpdir(), 'drax-tesseract-'));
            filePath = join(tempDir, `attachment${normalizeExtension(extension)}`);
            await writeFile(filePath, input);
        }
        const outputs = await Promise.all(TESSERACT_PROFILES.map((profile) => runTesseractProfile(filePath, profile)));
        const amountHints = extractAmountLikeLines(outputs[2] ?? '');
        return collectUniqueLines(outputs[0] ?? '', outputs[1] ?? '', amountHints);
    }
    finally {
        if (tempDir) {
            await rm(tempDir, { recursive: true, force: true });
        }
    }
}
