import { Injectable } from '@nestjs/common';
import { UserRegistrationService } from '@domain/user/services';
import { UserRegistrationInputDTO } from '../dto';

@Injectable()
export class UserRegistrationUseCase {
  constructor(
    private readonly userRegistrationService: UserRegistrationService,
  ) {}
  async execute(data: UserRegistrationInputDTO) {
    return this.userRegistrationService.userRegistration(data);
  }
}
