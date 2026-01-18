export abstract class ThreadGenerator {
  abstract create(): Promise<string>
}
