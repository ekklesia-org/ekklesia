import { removeEmptyValues } from './object-utils';

describe('removeEmptyValues', () => {
  it('preserves zero and empty string while removing null and undefined', () => {
    const input = { a: 0, b: '', c: null, d: undefined, e: [0, '', null, undefined] };
    const result = removeEmptyValues(input);
    expect(result).toEqual({ a: 0, b: '', e: [0, ''] });
  });
});
