/**
 * EAF results in a non-kWh energy result unit must equal the kWh results converted, so a fuel
 * baseline (MMBtu) can be compared with an EAF modification. Uses the EAF Dummy Values fixture
 * without its exhaust gas entry, the path where electricity input feeds gross heat directly.
 */
import { PHAST } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { ConvertValue } from '../../shared/convert-units/ConvertValue';
import { PhastResultsService } from '../../phast/phast-results.service';
import { buildPhastServices } from './snapshot.helper';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fixture = require('./fixtures/EAF Dummy Values.json');

function eafWithoutExhaustGas(): { phast: PHAST; settings: Settings } {
  const raw = structuredClone(fixture.assessments[0]);
  delete raw.assessment.phast.losses.exhaustGasEAF;
  return { phast: raw.assessment.phast, settings: raw.settings };
}

describe('EAF results by energy result unit', () => {
  let phastResultsService: PhastResultsService;

  beforeAll(async () => {
    phastResultsService = (await buildPhastServices()).phastResultsService;
  });

  it('gives the kWh results, converted, when the energy result unit is MMBtu', () => {
    const { phast, settings } = eafWithoutExhaustGas();
    const kWhResults = phastResultsService.getResults(phast, { ...settings, energyResultUnit: 'kWh' });
    const mmBtuResults = phastResultsService.getResults(phast, { ...settings, energyResultUnit: 'MMBtu' });
    const toMMBtu = (value: number) => new ConvertValue(value, 'kWh', 'MMBtu').convertedValue;

    expect(mmBtuResults.grossHeatInput).toBeCloseTo(toMMBtu(kWhResults.grossHeatInput), 6);
    expect(mmBtuResults.energyInputTotal).toBeCloseTo(toMMBtu(kWhResults.energyInputTotal), 6);
    expect(mmBtuResults.energyInputHeatDelivered).toBeCloseTo(toMMBtu(kWhResults.energyInputHeatDelivered), 6);
  });
});
