import { readFile } from 'node:fs/promises'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

export async function extractTextFromPdf(input: string | Buffer): Promise<string> {
    const buffer = typeof input === 'string' ? await readFile(input) : input
    const loadingTask = getDocument({
        data: new Uint8Array(buffer),
        useWorkerFetch: false,
        isEvalSupported: false,
        disableFontFace: true,
    })
    const pdf = await loadingTask.promise
    const pages: string[] = []

    try {
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
            const page = await pdf.getPage(pageNumber)
            const content = await page.getTextContent()
            const text = content.items
                .map((item: any) => ('str' in item ? item.str : ''))
                .filter(Boolean)
                .join(' ')
                .trim()

            if (text) {
                pages.push(text)
            }
        }
    } finally {
        await pdf.destroy()
    }

    return pages.join('\n\n').trim()
}
