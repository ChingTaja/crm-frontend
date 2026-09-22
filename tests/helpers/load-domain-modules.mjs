import { mkdtempSync, readFileSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import ts from 'typescript'

// Compile the domain dependency graph without bundling UI or adding a test framework.
export function loadDomainModules(paths) {
  const sourceRoot = fileURLToPath(new URL('../../src/', import.meta.url))
  const temporary = mkdtempSync(join(tmpdir(), 'crm-domain-'))
  const require = createRequire(import.meta.url)
  const compiled = new Set()
  function compile(path) {
    if (compiled.has(path)) return
    compiled.add(path)
    const source = readFileSync(resolve(sourceRoot, `${path}.ts`), 'utf8')
    for (const dependency of ts.preProcessFile(source).importedFiles) {
      if (dependency.fileName.startsWith('.')) compile(join(dirname(path), dependency.fileName))
    }
    const output = join(temporary, `${path}.js`)
    mkdirSync(dirname(output), { recursive: true })
    writeFileSync(output, ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText)
  }
  try {
    paths.forEach(compile)
    return paths.map(path => require(join(temporary, `${path}.js`)))
  } finally {
    rmSync(temporary, { recursive: true, force: true })
  }
}
