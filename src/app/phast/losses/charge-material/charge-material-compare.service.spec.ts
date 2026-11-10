import { ChargeMaterialCompareService } from './charge-material-compare.service';
import { ChargeMaterial, LiquidChargeMaterial } from '../../../shared/models/phast/losses/chargeMaterial';

function liquidMaterial(overrides: Partial<LiquidChargeMaterial> = {}): ChargeMaterial {
  return {
    chargeMaterialType: 'Liquid',
    liquidChargeMaterial: {
      materialId: 1,
      thermicReactionType: 0,
      specificHeatLiquid: 0.5,
      vaporizingTemperature: 300,
      latentHeat: 100,
      specificHeatVapor: 0.25,
      chargeFeedRate: 1000,
      initialTemperature: 70,
      dischargeTemperature: 400,
      percentVaporized: 10,
      percentReacted: 0,
      reactionHeat: 0,
      additionalHeat: 0,
      ...overrides,
    },
  };
}

describe('ChargeMaterialCompareService liquid comparisons', () => {
  let service: ChargeMaterialCompareService;

  beforeEach(() => {
    service = new ChargeMaterialCompareService();
  });

  function compareWith(modified: Partial<LiquidChargeMaterial>): void {
    service.baselineMaterials = [liquidMaterial()];
    service.modifiedMaterials = [liquidMaterial(modified)];
  }

  it('reports no difference for identical liquid materials', () => {
    compareWith({});
    expect(service.compareLiquidMaterial(0)).toBeFalse();
    expect(service.compareAllMaterials()).toBeFalse();
  });

  it('compareLiquidLatentHeat flags only a latent heat change', () => {
    compareWith({ latentHeat: 200 });
    expect(service.compareLiquidLatentHeat(0)).toBeTrue();
    expect(service.compareLiquidSpecificHeatVapor(0)).toBeFalse();
    expect(service.compareAllMaterials()).toBeTrue();
  });

  it('compareLiquidSpecificHeatVapor flags only a specific heat of vapor change', () => {
    compareWith({ specificHeatVapor: 0.5 });
    expect(service.compareLiquidSpecificHeatVapor(0)).toBeTrue();
    expect(service.compareLiquidLatentHeat(0)).toBeFalse();
    expect(service.compareAllMaterials()).toBeTrue();
  });

  it('compareLiquidChargeFeedRate flags a charge feed rate change', () => {
    compareWith({ chargeFeedRate: 2000 });
    expect(service.compareLiquidChargeFeedRate(0)).toBeTrue();
    expect(service.compareLiquidSpecificHeatVapor(0)).toBeFalse();
    expect(service.compareAllMaterials()).toBeTrue();
  });
});
