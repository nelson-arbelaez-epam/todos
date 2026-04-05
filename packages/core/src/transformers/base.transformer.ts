/**
 * Base transformer interface for converting between different DTO types
 */
export interface ITransformer<Input, Output> {
  transform(input: Input): Output;
  transformMany(inputs: Input[]): Output[];
}

/**
 * Abstract base class for implementing transformers
 */
export abstract class BaseTransformer<Input, Output>
  implements ITransformer<Input, Output>
{
  abstract transform(input: Input): Output;

  transformMany(inputs: Input[]): Output[] {
    return inputs.map((input) => this.transform(input));
  }
}
