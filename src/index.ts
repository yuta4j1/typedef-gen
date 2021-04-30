import { compile } from './compiler'
import fs from 'fs'

export function run(data: Object): void {
  // ファイル名など、CLIオプションでカスタマイズできるようにする
  const codeString = compile(data)
  // ファイル出力
  fs.writeFileSync('out/typedef.d.ts', codeString)
}
