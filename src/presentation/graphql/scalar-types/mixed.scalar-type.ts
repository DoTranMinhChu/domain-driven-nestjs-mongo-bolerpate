import { GraphQLScalarType } from 'graphql';

export const Mixed: GraphQLScalarType = new GraphQLScalarType({
  name: 'Mixed',
  description: 'Represents a value that can be of any type',

  serialize(value: any): any {
    // Your logic to convert a value to its GraphQL representation
    return value;
  },

  parseValue(value: any): any {
    // Your logic to parse a value received as a variable
    return value;
  },
});
