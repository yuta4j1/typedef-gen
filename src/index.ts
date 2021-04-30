import ts from 'typescript'

type TypeDef = {
  typeName: string
  def: any
}

function compile(obj: Object, options: ts.CompilerOptions): void {
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

  //   console.log(code)

  // Prepare and emit the d.ts files
  const resultFile = ts.createSourceFile(
    'out.d.ts',
    code,
    ts.ScriptTarget.Latest
  )
  //   console.log('resultFile', resultFile)
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })

  const result = printer.printNode(
    ts.EmitHint.Unspecified,
    resultFile,
    resultFile
  )
  console.log(result)
}

function convertKeyTypeObject(
  obj: Object,
  stock: TypeDef[],
  typeName?: string
): void {
  let retObj = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object') {
      let typeName = convertPascalCase(key)
      convertKeyTypeObject(value, stock, typeName)
      retObj[key] = typeName
    } else {
      retObj[key] = typeString(value)
    }
  }
  stock.push({ typeName: typeName || 'Root', def: retObj })
}

function typeString(data: any): string {
  switch (typeof data) {
    case 'string':
      return 'string'
    case 'boolean':
      return 'boolean'
    case 'number':
      return 'number'
    case 'object':
      return 'any'
    default:
      return 'any'
  }
}

// Run the compiler
compile(
  {
    name: 'takashi',
    id: 1,
    hasMoney: true,
    hoge: {
      id: 1,
      test: 'test',
    },
  },
  {
    allowJs: true,
    declaration: true,
    emitDeclarationOnly: true,
  }
)

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
