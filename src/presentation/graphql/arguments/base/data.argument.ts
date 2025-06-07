import { Args, ArgsOptions } from '@nestjs/graphql';

export function DataArg(
  property: string = 'data',
  options: ArgsOptions = {},
): ParameterDecorator {
  return (
    target: Object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    // Gọi decorator gốc, truyền vào đúng target/prop/index
    return Args(property, options)(target, propertyKey!, parameterIndex);
  };
}
