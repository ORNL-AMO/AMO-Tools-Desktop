import { TestBed } from '@angular/core/testing';
import { ImportOpportunitiesService } from './import-opportunities.service';
import { UpdateDataService } from '../../shared/helper-services/update-data.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Treasure } from '../../shared/models/treasure-hunt';
import { AdjustedOrActual, BilledForDemand } from '../../calculator/utilities/power-factor-correction/power-factor-correction.service';

describe('ImportOpportunitiesService.updateLegacyOpportunities', () => {
  let service: ImportOpportunitiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ImportOpportunitiesService, UpdateDataService, ConvertUnitsService]
    });
    service = TestBed.inject(ImportOpportunitiesService);
  });

  // ─── opportunityType stamping ────────────────────────────────────────────────

  it('stamps opportunityType when not already set', () => {
    const opp: any = { someField: true };
    service.updateLegacyOpportunities([opp], Treasure.opportunitySheet);
    expect(opp.opportunityType).toBe(Treasure.opportunitySheet);
  });

  it('does not overwrite an existing opportunityType', () => {
    const opp: any = { opportunityType: Treasure.opportunitySheet };
    service.updateLegacyOpportunities([opp], Treasure.opportunitySheet);
    expect(opp.opportunityType).toBe(Treasure.opportunitySheet);
  });

  // ─── lightingReplacement ─────────────────────────────────────────────────────

  describe('lightingReplacement', () => {
    it('sets default ballastFactor, lumenDegradationFactor, coefficientOfUtilization, and category when missing', () => {
      const opp: any = {
        baseline: [{ watts: 100, quantity: 5 }],
        modifications: [{ watts: 60, quantity: 5 }]
      };
      service.updateLegacyOpportunities([opp], Treasure.lightingReplacement);
      expect(opp.baseline[0].ballastFactor).toBe(1);
      expect(opp.baseline[0].lumenDegradationFactor).toBe(1);
      expect(opp.baseline[0].coefficientOfUtilization).toBe(1);
      expect(opp.baseline[0].category).toBe(0);
      expect(opp.modifications[0].ballastFactor).toBe(1);
      expect(opp.modifications[0].lumenDegradationFactor).toBe(1);
      expect(opp.modifications[0].coefficientOfUtilization).toBe(1);
      expect(opp.modifications[0].category).toBe(0);
    });

    it('does not overwrite existing ballastFactor, lumenDegradationFactor, coefficientOfUtilization, or category', () => {
      const opp: any = {
        baseline: [{ ballastFactor: 0.9, lumenDegradationFactor: 0.8, coefficientOfUtilization: 0.7, category: 2 }],
        modifications: []
      };
      service.updateLegacyOpportunities([opp], Treasure.lightingReplacement);
      expect(opp.baseline[0].ballastFactor).toBe(0.9);
      expect(opp.baseline[0].lumenDegradationFactor).toBe(0.8);
      expect(opp.baseline[0].coefficientOfUtilization).toBe(0.7);
      expect(opp.baseline[0].category).toBe(2);
    });
  });

  // ─── electricityReduction ────────────────────────────────────────────────────

  describe('electricityReduction', () => {
    it('sets userSelectedHP to true for Imperial settings', () => {
      const opp: any = {
        baseline: [{ userSelectedHP: undefined }],
        modification: [{ userSelectedHP: undefined }]
      };
      service.updateLegacyOpportunities([opp], Treasure.electricityReduction, 'Imperial');
      expect(opp.baseline[0].userSelectedHP).toBe(true);
      expect(opp.modification[0].userSelectedHP).toBe(true);
    });

    it('sets userSelectedHP to false for Metric settings', () => {
      const opp: any = {
        baseline: [{ userSelectedHP: undefined }],
        modification: [{ userSelectedHP: undefined }]
      };
      service.updateLegacyOpportunities([opp], Treasure.electricityReduction, 'Metric');
      expect(opp.baseline[0].userSelectedHP).toBe(false);
      expect(opp.modification[0].userSelectedHP).toBe(false);
    });

    it('does not overwrite an existing userSelectedHP value', () => {
      const opp: any = {
        baseline: [{ userSelectedHP: false }],
        modification: []
      };
      service.updateLegacyOpportunities([opp], Treasure.electricityReduction, 'Imperial');
      expect(opp.baseline[0].userSelectedHP).toBe(false);
    });
  });

  // ─── compressedAir ───────────────────────────────────────────────────────────

  describe('compressedAir', () => {
    it('migrates legacy bag method height/diameter/fillTime fields', () => {
      const opp: any = {
        baseline: [{
          bagMethodData: { height: 10, diameter: 5, fillTime: 30 },
          hoursPerYear: 8760
        }],
        modification: [{
          bagMethodData: { height: 10, diameter: 5, fillTime: 30 },
          hoursPerYear: 8760
        }]
      };
      service.updateLegacyOpportunities([opp], Treasure.compressedAir);
      expect(opp.baseline[0].bagMethodData.bagVolume).toBe(0);
      expect(opp.baseline[0].bagMethodData.bagFillTime).toBe(30);
      expect(opp.baseline[0].bagMethodData.operatingTime).toBe(8760);
      expect(opp.modification[0].bagMethodData.bagVolume).toBe(0);
      expect(opp.modification[0].bagMethodData.bagFillTime).toBe(30);
      expect(opp.modification[0].bagMethodData.operatingTime).toBe(8760);
    });

    it('falls back bagFillTime to 0 when fillTime is absent', () => {
      const opp: any = {
        baseline: [{
          bagMethodData: { height: 10, diameter: 5 },
          hoursPerYear: 4000
        }],
        modification: []
      };
      service.updateLegacyOpportunities([opp], Treasure.compressedAir);
      expect(opp.baseline[0].bagMethodData.bagFillTime).toBe(0);
      expect(opp.baseline[0].bagMethodData.operatingTime).toBe(4000);
    });

    it('does not touch data that is already in the new bag method shape', () => {
      const opp: any = {
        baseline: [{
          bagMethodData: { bagVolume: 5, bagFillTime: 30, operatingTime: 8760 }
        }],
        modification: []
      };
      service.updateLegacyOpportunities([opp], Treasure.compressedAir);
      expect(opp.baseline[0].bagMethodData.bagVolume).toBe(5);
    });
  });

  // ─── compressedAirPressure ───────────────────────────────────────────────────

  describe('compressedAirPressure', () => {
    it('sets default atmosphericPressure, pressureRated, and powerType on baseline and modification', () => {
      const opp: any = {
        baseline: [{ pressure: 100 }],
        modification: [{ pressure: 90 }]
      };
      service.updateLegacyOpportunities([opp], Treasure.compressedAirPressure);
      expect(opp.baseline[0].atmosphericPressure).toBe(0);
      expect(opp.baseline[0].pressureRated).toBe(0);
      expect(opp.baseline[0].powerType).toBe('Measured');
      expect(opp.modification[0].atmosphericPressure).toBe(0);
      expect(opp.modification[0].pressureRated).toBe(0);
      expect(opp.modification[0].powerType).toBe('Measured');
    });

    it('does not overwrite existing powerType', () => {
      const opp: any = {
        baseline: [{ powerType: 'Electrical' }],
        modification: []
      };
      service.updateLegacyOpportunities([opp], Treasure.compressedAirPressure);
      expect(opp.baseline[0].powerType).toBe('Electrical');
    });
  });

  // ─── airLeak ─────────────────────────────────────────────────────────────────

  describe('airLeak', () => {
    it('migrates legacy bag method height/diameter/fillTime fields', () => {
      const opp: any = {
        airLeakSurveyInput: {
          compressedAirLeakSurveyInputVec: [{
            bagMethodData: { height: 10, diameter: 5, fillTime: 30 }
          }],
          facilityCompressorData: { hoursPerYear: 8760 }
        }
      };
      service.updateLegacyOpportunities([opp], Treasure.airLeak);
      const bag = opp.airLeakSurveyInput.compressedAirLeakSurveyInputVec[0].bagMethodData;
      expect(bag.bagVolume).toBe(0);
      expect(bag.bagFillTime).toBe(30);
      expect(bag.operatingTime).toBe(8760);
    });

    it('does not touch data that is already in the new bag method shape', () => {
      const opp: any = {
        airLeakSurveyInput: {
          compressedAirLeakSurveyInputVec: [{
            bagMethodData: { bagVolume: 3, bagFillTime: 20, operatingTime: 4000 }
          }],
          facilityCompressorData: { hoursPerYear: 4000 }
        }
      };
      service.updateLegacyOpportunities([opp], Treasure.airLeak);
      const bag = opp.airLeakSurveyInput.compressedAirLeakSurveyInputVec[0].bagMethodData;
      expect(bag.bagVolume).toBe(3);
    });
  });

  // ─── heatCascading ───────────────────────────────────────────────────────────

  describe('heatCascading', () => {
    it('maps legacy priFuelHV to fuelHV and secFuelCost to fuelCost', () => {
      const opp: any = {
        inputData: { priFuelHV: 1000, secFuelCost: 5 }
      };
      service.updateLegacyOpportunities([opp], Treasure.heatCascading);
      expect(opp.inputData.fuelHV).toBe(1000);
      expect(opp.inputData.fuelCost).toBe(5);
    });

    it('does not overwrite existing fuelHV or fuelCost', () => {
      const opp: any = {
        inputData: { fuelHV: 2000, fuelCost: 10 }
      };
      service.updateLegacyOpportunities([opp], Treasure.heatCascading);
      expect(opp.inputData.fuelHV).toBe(2000);
      expect(opp.inputData.fuelCost).toBe(10);
    });
  });

  // ─── powerFactorCorrection ───────────────────────────────────────────────────

  describe('powerFactorCorrection', () => {
    it('migrates numbered input fields for REAL_POWER + POWER_FACTOR combination', () => {
      const opp: any = {
        inputData: {
          billedForDemand: BilledForDemand.REAL_POWER,
          adjustedOrActual: AdjustedOrActual.POWER_FACTOR,
          monthyInputs: [{ month: 'January', input1: 100, input2: 0.9 }]
        }
      };
      service.updateLegacyOpportunities([opp], Treasure.powerFactorCorrection);
      expect(opp.inputData.monthyInputs[0].pfAdjustedDemand).toBe(100);
      expect(opp.inputData.monthyInputs[0].powerFactor).toBe(0.9);
    });

    it('migrates numbered input fields for REAL_POWER + ACTUAL_DEMAND combination', () => {
      const opp: any = {
        inputData: {
          billedForDemand: BilledForDemand.REAL_POWER,
          adjustedOrActual: AdjustedOrActual.ACTUAL_DEMAND,
          monthyInputs: [{ month: 'January', input1: 200, input2: 0.85 }]
        }
      };
      service.updateLegacyOpportunities([opp], Treasure.powerFactorCorrection);
      expect(opp.inputData.monthyInputs[0].actualDemand).toBe(200);
      expect(opp.inputData.monthyInputs[0].powerFactor).toBe(0.85);
    });

    it('migrates numbered input fields for REAL_POWER + BOTH combination', () => {
      const opp: any = {
        inputData: {
          billedForDemand: BilledForDemand.REAL_POWER,
          adjustedOrActual: AdjustedOrActual.BOTH,
          monthyInputs: [{ month: 'January', input1: 200, input2: 0.85, input3: 180 }]
        }
      };
      service.updateLegacyOpportunities([opp], Treasure.powerFactorCorrection);
      expect(opp.inputData.monthyInputs[0].actualDemand).toBe(200);
      expect(opp.inputData.monthyInputs[0].powerFactor).toBe(0.85);
      expect(opp.inputData.monthyInputs[0].pfAdjustedDemand).toBe(180);
    });

    it('migrates numbered input fields for APPARENT_POWER + ACTUAL_DEMAND combination', () => {
      const opp: any = {
        inputData: {
          billedForDemand: BilledForDemand.APPARENT_POWER,
          adjustedOrActual: AdjustedOrActual.ACTUAL_DEMAND,
          monthyInputs: [{ month: 'January', input1: 150, input2: 140 }]
        }
      };
      service.updateLegacyOpportunities([opp], Treasure.powerFactorCorrection);
      expect(opp.inputData.monthyInputs[0].pfAdjustedDemand).toBe(150);
      expect(opp.inputData.monthyInputs[0].actualDemand).toBe(140);
    });

    it('does not re-migrate already-migrated month inputs', () => {
      const opp: any = {
        inputData: {
          billedForDemand: BilledForDemand.REAL_POWER,
          adjustedOrActual: AdjustedOrActual.POWER_FACTOR,
          monthyInputs: [{ month: 'January', pfAdjustedDemand: 100, powerFactor: 0.9 }]
        }
      };
      service.updateLegacyOpportunities([opp], Treasure.powerFactorCorrection);
      expect(opp.inputData.monthyInputs[0].pfAdjustedDemand).toBe(100);
      expect(opp.inputData.monthyInputs[0].powerFactor).toBe(0.9);
    });
  });

  // ─── stamp-only types ────────────────────────────────────────────────────────

  const stampOnlyTypes: string[] = [
    Treasure.replaceExisting,
    Treasure.motorDrive,
    Treasure.naturalGasReduction,
    Treasure.waterReduction,
    Treasure.steamReduction,
    Treasure.pipeInsulation,
    Treasure.tankInsulation,
    Treasure.openingLoss,
    Treasure.airHeating,
    Treasure.wallLoss,
    Treasure.leakageLoss,
    Treasure.flueGas,
    Treasure.wasteHeat,
    Treasure.waterHeating,
    Treasure.coolingTowerMakeup,
    Treasure.chillerStaging,
    Treasure.chillerPerformance,
    Treasure.coolingTowerFan,
    Treasure.coolingTowerBasin,
    Treasure.boilerBlowdownRate,
    Treasure.assessmentOpportunity,
  ];

  stampOnlyTypes.forEach(type => {
    it(`stamps opportunityType for ${type}`, () => {
      const opp: any = {};
      service.updateLegacyOpportunities([opp], type);
      expect(opp.opportunityType).toBe(type);
    });
  });
});
