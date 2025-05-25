import { Args, ArgsOptions } from '@nestjs/graphql';

export function DataArg(options: ArgsOptions = {}): ParameterDecorator {
  return (
    target: Object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    // Gọi decorator gốc, truyền vào đúng target/prop/index
    return Args('_id', options)(target, propertyKey!, parameterIndex);
  };
}
