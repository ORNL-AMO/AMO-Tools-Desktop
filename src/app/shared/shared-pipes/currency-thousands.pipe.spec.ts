import { CurrencyThousandsPipe } from './currency-thousands.pipe';

describe('CurrencyThousandsPipe', () => {
  it('create an instance', () => {
    const pipe = new CurrencyThousandsPipe();
    expect(pipe).toBeTruthy();
  });
});
