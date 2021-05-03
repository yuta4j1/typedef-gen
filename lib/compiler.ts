import ts from 'typescript'

type TypeDef = {
  typeName: string
  def: any
}

export function compile(obj: Object): string {
  if (typeof obj !== 'object') {
    console.warn('type is not object.')
    return
  }

  let keyTypes: TypeDef[] = []
  convertKeyTypeObject(obj, keyTypes)

  const code = `
    ${keyTypes.map((v) => {
      return `
          type ${v.typeName} = {
              ${Object.entries(v.def)
                .map(([key, value]) => {
                  return `${key}: ${value};`
                })
                .join('\n')}
          };
        `
    })}`

  const resultFile = ts.createSourceFile('out.ts', code, ts.ScriptTarget.Latest)

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })

  const result = printer.printNode(
    ts.EmitHint.Unspecified,
    resultFile,
    resultFile
  )
  console.log(result)
  return result
}

function convertKeyTypeObject(
  obj: Object,
  typeDefs: TypeDef[],
  typeName?: string
): void {
  let srcObj = obj
  let retObj = {}
  if (Array.isArray(obj)) {
    srcObj = obj[0]
  }
  if (isIndexStringKey(srcObj)) {
    // キー文字列が不定の場合
    let keyName = '[key: string]'
    let [, value] = Object.entries(srcObj)[0]
    if (typeof value === 'object') {
      convertKeyTypeObject(value, typeDefs, typeName)
      retObj[keyName] = typeName
    } else {
      retObj[keyName] = typeString(value)
    }
  } else {
    for (const [key, value] of Object.entries(srcObj)) {
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          // 配列の場合
          if (typeof value[0] === 'object') {
            let typeName = convertPascalCase(key)
            convertKeyTypeObject(value[0], typeDefs, typeName)
            retObj[key] = typeName + '[]'
          } else {
            let typeName = typeString(value[0])
            retObj[key] = typeName + '[]'
          }
        } else {
          let typeName = convertPascalCase(key)
          convertKeyTypeObject(value, typeDefs, typeName)
          retObj[key] = typeName
        }
      } else {
        retObj[key] = typeString(value)
      }
    }
  }

  typeDefs.push({ typeName: typeName || 'Root', def: retObj })
}

function typeString(data: any): string {
  switch (typeof data) {
    case 'string':
      return 'string'
    case 'boolean':
      return 'boolean'
    case 'number':
      return 'number'
    default:
      return 'any'
  }
}

// キーがstring literalの場合、キー文字列は可変なので、
// その場合の処理分岐を行うために判定を行いたい。
// 現状、ハイフン'-' とピリオド '.' が含まれる文字列に関しては、string literalである
// という判定を行うが、より正確な判定を行うよう修正するべき
function isIndexStringKey(data: Object): boolean {
  const keys = Object.keys(data)
  if (keys.length === 0) {
    return false
  }
  const filtered = Object.keys(data).filter((v) => {
    return v.includes('-') || v.includes('.')
  })

  return filtered.length > 0
}

function convertPascalCase(src: string): string {
  let toUpper = false
  return src
    .split('')
    .map((v, i) => {
      if (i === 0 || toUpper) {
        toUpper = false
        return v.toUpperCase()
      } else {
        if (v === '_') {
          toUpper = true
          return ''
        }
        return v
      }
    })
    .join('')
}
