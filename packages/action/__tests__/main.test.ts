import getInputs, { ActionInputs } from '../src/input'

function multilineToString<T>(value?: T | T[]) {
   if (!value) return undefined
   if (Array.isArray(value)) return value.join('\n')
   return value
}

function mockInput(input: ActionInputs) {
   process.env.INPUT_FROM = multilineToString(input.from)
   process.env.INPUT_OUTPUT = input.output
   process.env.INPUT_CACHE = input.cache ? 'true' : 'false'
   process.env.INPUT_INCLUDE = multilineToString(input.include)
   process.env.INPUT_EXCLUDE = multilineToString(input.exclude)
}

test('parsed inputs', async () => {
   const expected: ActionInputs = {
      cache: true,
      output: 'test.zip',
      from: ['some-dir'],
      exclude: ['this', 'that/**.png'],
      include: ['thus'],
   }

   mockInput(expected)

   const inputs = getInputs()
   expect(inputs).toStrictEqual(expected)
})
