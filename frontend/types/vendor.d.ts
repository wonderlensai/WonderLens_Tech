declare module 'ffprobe-static' {
  const ffprobe: { path: string }
  export default ffprobe
}

declare module 'pg' {
  export class Pool {
    constructor(config?: any)
    query<T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount: number }>
  }
}
