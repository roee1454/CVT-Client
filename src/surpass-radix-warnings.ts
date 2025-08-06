if (process.env.NODE_ENV === 'development') {
  const radixWarningPrefixes = [
    'Radix UI:',
    'Warning:',
  ]

  const originalWarn = console.warn
  console.warn = (...args) => {
    const message = args[0]
    if (
      typeof message === 'string' &&
      radixWarningPrefixes.some(prefix => message.startsWith(prefix))
    ) {
      return
    }
    originalWarn(...args)
  }
}
