import { RemoveCommasPipe } from "./remove-commas.pipe";


describe('RemoveCommasPipe', () => {
  it('create an instance', () => {
    const pipe = new RemoveCommasPipe();
    expect(pipe).toBeTruthy();
  });
});
