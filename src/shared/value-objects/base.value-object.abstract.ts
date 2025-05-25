import * as _ from 'lodash';

export abstract class ABaseValueObject<T> {
  protected readonly value: T;

  constructor(value: T) {
    this.value = Object.freeze(value);
    this.validate(value);
  }

  public getValue(): T {
    return this.value;
  }

  protected abstract validate(_value: T): void;

  public isEqual(vo?: ABaseValueObject<T>): boolean {
    return _.isEqual(this.value, vo);
  }
}
