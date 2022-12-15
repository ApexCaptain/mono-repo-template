export class Hello {
  public sayHello() {
    return 'hello, world!';
  }
}

export class Some<T> {
  constructor(public a: T) {}
}
