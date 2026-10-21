import { type CompressorCatalogRecord } from 'measur-tools-suite';
import { CompressedAirDataManagementService } from '../compressed-air-assessment/compressed-air-data-management.service';
import { CompressorDataManagementService } from '../compressed-air-inventory/compressor-data-management.service';
import { DefaultCompressorApiService } from './default-compressor-api.service';
import { ToolsSuiteApiService } from './tools-suite-api.service';

describe('DefaultCompressorApiService', () => {
  function catalogRecord(overrides: Partial<CompressorCatalogRecord> = {}): CompressorCatalogRecord {
    return {
      id: 1,
      fullLoadBrakeHorsepower: 125,
      fullLoadBhpPowerKw: 999,
      blowdownTimeSec: 40,
      designInletPressurePsia: 14.5,
      designInletTemperatureF: 68,
      designSurgeFlowAcfm: -9999,
      horsepower: 125,
      compressorTypeId: 1,
      controlTypeId: 4,
      maxFullFlowPressurePsig: 110,
      maxSurgePressureFlowAcfm: -9999,
      maxSurgePressurePsig: -9999,
      minStonewallPressureFlowAcfm: -9999,
      minStonewallPressurePsig: -9999,
      minUnloadSumpPressurePsig: 15,
      model: '125 hp/90 kW',
      modulatingPressureRangePsig: -9999,
      noLoadPowerFullyModulating: -9999,
      noLoadPowerUnload: 50,
      ratedCapacityAcfm: 659,
      ratedPressurePsig: 100,
      specificPackagePower: 16.1,
      totalPackageInputPowerKw: 106,
      unloadPointPercent: 100,
      unloadSteps: 2,
      fullLoadAmps: 142,
      fullLoadEfficiencyPercent: 92.4,
      ...overrides
    };
  }

  function selectedCompressor(): any {
    return {
      nameplateData: {},
      compressorControls: {},
      designDetails: {},
      centrifugalSpecifics: {},
      performancePoints: {
        fullLoad: {},
        maxFullFlow: {},
        noLoad: {},
        unloadPoint: {}
      }
    };
  }

  function selectedInventoryCompressor(): any {
    return {
      nameplateData: {},
      compressedAirControlsProperties: {},
      compressedAirDesignDetailsProperties: {},
      compressedAirMotor: {},
      centrifugalSpecifics: {},
      compressedAirPerformancePointsProperties: {
        fullLoad: {},
        maxFullFlow: {},
        noLoad: {},
        unloadPoint: {}
      }
    };
  }

  it('maps full-load BHP from the corrected catalog property', () => {
    const service = new DefaultCompressorApiService({} as ToolsSuiteApiService);
    const suiteRecord = catalogRecord();

    const compressor = service.getGenericCompressorFromWASM(suiteRecord);

    expect(compressor.PowerFLBHP).toBe(125);
  });

  it('deletes the suite-owned catalog vector but not its plain record values', () => {
    const service = new DefaultCompressorApiService({} as ToolsSuiteApiService);
    const record = catalogRecord();
    const recordDelete = jasmine.createSpy('recordDelete');
    (record as CompressorCatalogRecord & { delete: () => void }).delete = recordDelete;
    const vector = {
      size: () => 1,
      get: () => record,
      delete: jasmine.createSpy('vectorDelete')
    } as any;
    const compressors = [];

    service.buildDefaultCompressorList(vector, compressors);

    expect(compressors.length).toBe(1);
    expect(vector.delete).toHaveBeenCalled();
    expect(recordDelete).not.toHaveBeenCalled();
  });

  it('normalizes every unavailable optional catalog value in both compressor selection flows', () => {
    const unavailableFields = {
      BlowdownTime: -9999,
      DesignSurgeFlow: -9999,
      MaxPressSurgeFlow: -9999,
      MaxSurgePressure: -9999,
      MinPressStonewallFlow: -9999,
      MinStonewallPressure: -9999,
      MinULSumpPressure: -9999,
      ModulatingPressRange: -9999,
      NoLoadPowerFM: -9999
    };
    const genericCompressor = {
      ...new DefaultCompressorApiService({} as ToolsSuiteApiService)
        .getGenericCompressorFromWASM(catalogRecord()),
      ...unavailableFields
    };

    const assessmentCompressor = selectedCompressor();
    const assessmentData = new CompressedAirDataManagementService(
      null,
      { selectedCompressor: { getValue: () => assessmentCompressor } } as any,
      null
    );
    spyOn(assessmentData, 'updateAssessmentFromDependentCompressorItem');
    assessmentData.setCompressorDataFromGenericCompressorDb(genericCompressor);

    const inventoryCompressor = selectedInventoryCompressor();
    const inventoryData = new CompressorDataManagementService(
      null,
      { selectedCompressedAirItem: { getValue: () => inventoryCompressor } } as any,
      null
    );
    spyOn(inventoryData, 'updateCatalogFromDependentCompressorItem');
    inventoryData.setCompressorDataFromGenericCompressorDb(genericCompressor);

    expect(assessmentCompressor.designDetails.noLoadPowerFM).toBeNull();
    expect(assessmentCompressor.compressorControls.unloadSumpPressure).toBeNull();
    expect(assessmentCompressor.designDetails.blowdownTime).toBeNull();
    expect(assessmentCompressor.designDetails.modulatingPressureRange).toBeNull();
    expect(assessmentCompressor.centrifugalSpecifics).toEqual({
      minFullLoadPressure: null,
      minFullLoadCapacity: null,
      surgeAirflow: null,
      maxFullLoadPressure: null,
      maxFullLoadCapacity: null
    });

    expect(inventoryCompressor.compressedAirDesignDetailsProperties.noLoadPowerFM).toBeNull();
    expect(inventoryCompressor.compressedAirControlsProperties.unloadSumpPressure).toBeNull();
    expect(inventoryCompressor.compressedAirDesignDetailsProperties.blowdownTime).toBeNull();
    expect(inventoryCompressor.compressedAirDesignDetailsProperties.modulatingPressureRange).toBeNull();
    expect(inventoryCompressor.centrifugalSpecifics).toEqual({
      minFullLoadPressure: null,
      minFullLoadCapacity: null,
      surgeAirflow: null,
      maxFullLoadPressure: null,
      maxFullLoadCapacity: null
    });
  });
});
