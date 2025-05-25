import { Args, ArgsOptions } from '@nestjs/graphql';

export function _idArg(
  options: Omit<ArgsOptions, 'type'> = {},
): ParameterDecorator {
  return (
    target: Object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    // Gọi decorator gốc, truyền vào đúng target/prop/index
    return Args('_id', { type: () => String, ...options })(
      target,
      propertyKey!,
      parameterIndex,
    );
  };
}
