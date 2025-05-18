export class UserEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    private _password: string,
    public role: 'USER' | 'ADMIN',
  ) {}

  // Password hashing logic có thể đặt ở đây
  setPassword(hash: string) {
    this._password = hash;
  }

  validatePassword(hash: string): boolean {
    return this._password === hash;
  }
}
