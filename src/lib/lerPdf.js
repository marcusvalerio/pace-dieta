// Extrai o texto do PDF no próprio aparelho, linha por linha.
import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

export async function lerPdf(arquivo) {
  const dados = new Uint8Array(await arquivo.arrayBuffer())
  const doc = await pdfjs.getDocument({ data: dados }).promise
  const linhas = []
  for (let p = 1; p <= doc.numPages; p++) {
    const pagina = await doc.getPage(p)
    const { items } = await pagina.getTextContent()
    const porY = new Map()
    items.forEach(it => {
      if (!it.str.trim()) return
      const y = Math.round(it.transform[5] / 3) * 3
      if (!porY.has(y)) porY.set(y, [])
      porY.get(y).push({ x: it.transform[4], s: it.str })
    })
    ;[...porY.entries()].sort((a, b) => b[0] - a[0]).forEach(([, partes]) => {
      const texto = partes.sort((a, b) => a.x - b.x).map(p => p.s).join(' ').replace(/\s+/g, ' ').trim()
      if (texto) linhas.push(texto)
    })
  }
  return { linhas, paginas: doc.numPages }
}
