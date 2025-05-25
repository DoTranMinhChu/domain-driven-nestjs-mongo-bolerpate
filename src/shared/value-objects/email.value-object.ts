import { BadRequestException } from '@nestjs/common';
import { ABaseValueObject } from './base.value-object.abstract';
import { EXCEPTION } from '@shared/exceptions/exception';

export class EmailValueObject extends ABaseValueObject<string> {
  protected override validate(_value: string): void {
    if (!this.isValid(this.value)) {
      throw new BadRequestException(EXCEPTION.EMAIL_FORMAT_INVALID);
    }
  }
  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
