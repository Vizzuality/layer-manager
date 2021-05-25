import { concatenation, replace, substitution } from '../src';

describe('Layer Manager Utils: Query', () => {
  it('{{key}} string substitution', () => {
    const result = substitution('my name is {{name}}', { name: 'LayerManager' });
    expect(result).toEqual('my name is LayerManager');
  });

  it('{{key}} string concatenation', () => {
    const result = concatenation('select * from data {{where1}}', {
      where1: { name: 'LayerManager', age: 12, ids: [1, 2] },
    });
    expect(result)
      .toEqual('select * from data WHERE name = \'LayerManager\' AND age = 12 AND ids IN (1, 2)');
  });

  it('{{key}} string replace', () => {
    const result = replace(
      'select * from {{tableName}} {{where1}}',
      { tableName: 'data' },
      { where1: { name: 'LayerManager', age: 12, ids: [1, 2] } },
    );
    expect(result)
      .toEqual('select * from data WHERE name = \'LayerManager\' AND age = 12 AND ids IN (1, 2)');
  });
});
