export function toPgVector(vec: number[]) {
  // pgvector accepts a string literal like: '[0.1,0.2,...]'
  // Using a string keeps this dependency-free (no pgvector driver helpers).
  return `[${vec.join(',')}]`
}

