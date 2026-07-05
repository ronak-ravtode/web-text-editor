declare module 'html-to-docx' {
  function htmlToDocx(
    htmlString: string,
    headerHtml?: string,
    options?: {
      margin?: {
        top?: number
        right?: number
        bottom?: number
        left?: number
      }
      title?: string
    }
  ): Promise<Blob>
  export default htmlToDocx
}
