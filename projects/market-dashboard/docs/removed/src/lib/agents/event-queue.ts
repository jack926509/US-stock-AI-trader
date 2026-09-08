// Async event queue —
// 多個並行 task 把事件 push 進來，consumer 用 for-await iter() 拉。
// 用途：orchestrator 同時跑 6 位大師時，需要一個共用「水管」把各自的 chunk
// 交織成單一事件流再 yield 出去。

export class EventQueue<T> {
  private resolvers: Array<(v: IteratorResult<T>) => void> = []
  private buffered: T[] = []
  private closed = false

  push(value: T): void {
    if (this.closed) return
    const r = this.resolvers.shift()
    if (r) r({ value, done: false })
    else this.buffered.push(value)
  }

  close(): void {
    if (this.closed) return
    this.closed = true
    for (const r of this.resolvers) r({ value: undefined as unknown as T, done: true })
    this.resolvers = []
  }

  async *iter(): AsyncGenerator<T> {
    while (true) {
      if (this.buffered.length > 0) {
        yield this.buffered.shift() as T
        continue
      }
      if (this.closed) return
      const result = await new Promise<IteratorResult<T>>((resolve) => {
        this.resolvers.push(resolve)
      })
      if (result.done) return
      yield result.value
    }
  }
}
