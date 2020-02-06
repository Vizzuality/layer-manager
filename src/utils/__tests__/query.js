import { replace, concatenation, substitution } from 'utils/query';

describe('Tests utils/query', () => {
  it('replace fn ignores typeof !== string', () => {
    const numberInput = 1245643;
    const result = replace(numberInput);
    expect(result).toBe(numberInput);
  });

  it('substitution fn replaces all instances of the provided keys', () => {
    const input =
      "SELECT * from dummy where column = '{{firstColumn}}' and data = {{secondColumn}} and meta = {{secondColumn}}";
    const params = {
      firstColumn: 'MY_COLUMN',
      secondColumn: 1
    };
    expect(substitution(input, params)).toMatch(
      `SELECT * from dummy where column = '${params.firstColumn}' and data = ${params.secondColumn} and meta = ${params.secondColumn}`
    );
  });

  it('concatenation fn adds optional parameters WHERE – AND', () => {
    const input = 'SELECT * from dummy {{where}} {{and}}';
    const sqlParams = {
      where: { column: 'MY_COLUMN' },
      and: { secondColumn: 'MY_SECOND' }
    };
    expect(concatenation(input, sqlParams)).toMatch(
      `SELECT * from dummy WHERE column = '${sqlParams.where.column}' AND secondColumn = '${sqlParams.and.secondColumn}'`
    );
  });

  it('concatenation fn adds multiple optional parameter WHERE – AND', () => {
    const input = 'SELECT * from dummy {{where}} {{and}} {{and2}}';
    const sqlParams = {
      where: { column: 'MY_COLUMN' },
      and: { secondColumn: 'MY_SECOND' },
      and2: { thirdColumn: 'MY_THIRD' }
    };
    expect(concatenation(input, sqlParams)).toMatch(
      `SELECT * from dummy WHERE column = '${sqlParams.where.column}' AND secondColumn = '${sqlParams.and.secondColumn}' AND thirdColumn = '${sqlParams.and2.thirdColumn}'`
    );
  });

  it('concatenation fn adds array and number parameters', () => {
    const input = 'SELECT * from dummy {{where}} {{and}} {{and2}}';
    const sqlParams = {
      where: { column: 1234 },
      and: { secondColumn: [1, 2, 3] }
    };
    expect(concatenation(input, sqlParams)).toMatch(
      `SELECT * from dummy WHERE column = ${
        sqlParams.where.column
      } AND secondColumn IN (${sqlParams.and.secondColumn.join(', ')})`
    );
  });
});
