import { SettingsLabelPipe } from './settings-label.pipe';
import { ConvertUnitsService } from '../convert-units/convert-units.service';

describe('SettingsLabelPipe', () => {
  it('create an instance', () => {
    const convertUnitsService = new ConvertUnitsService();
    const pipe = new SettingsLabelPipe(convertUnitsService);
    expect(pipe).toBeTruthy();
  });
});
