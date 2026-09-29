export type TransferReceiptExtractionResult = {
  tool: "PdfTextExtractor" | "TesseractOCR"
  extractionSource: "AI" | "FALLBACK"
  filename: string | null
  mimetype: string | null
  text: string
  receipt: {
    transferDate: string | null
    amount: number | null
    operationNumber: string | null
  }
  reasoning: string | null
  aiError?: string
}

class TransferReceiptTestProvider {
  static singleton: TransferReceiptTestProvider

  basePath = "/api/transfer-emails/receipt-test"

  static get instance() {
    if (!TransferReceiptTestProvider.singleton) {
      TransferReceiptTestProvider.singleton = new TransferReceiptTestProvider()
    }

    return TransferReceiptTestProvider.singleton
  }

  async extract(file: File): Promise<TransferReceiptExtractionResult> {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${this.basePath}/extract`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null)
      throw new Error(errorBody?.message || "No se pudo procesar el comprobante.")
    }

    return await response.json() as TransferReceiptExtractionResult
  }
}

export default TransferReceiptTestProvider
