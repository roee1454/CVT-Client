if (process.env.NODE_ENV === 'development') {
  const radixErrorPrefixes = [
    "Warning: Function components cannot be given refs"
  ]

  const originalError = console.warn
  console.error = (...args) => {
    const message = args[0]
    if (
      typeof message === 'string' &&
      radixErrorPrefixes.some(prefix => message.startsWith(prefix))
    ) {
      return
    }
    originalError(...args)
  }
}
