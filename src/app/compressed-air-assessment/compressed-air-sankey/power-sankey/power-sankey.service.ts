import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { AirPropertiesCsvService } from '../../../shared/helper-services/air-properties-csv.service';
import { CompressedAirAssessment, CompressorInventoryItem, ProfileSummary } from '../../../shared/models/compressed-air-assessment';

@Injectable()
export class PowerSankeyService {
  baseSize: number = 300;
  airPropertiesLookupLimits = {temperatureLowRange: -50, temperatureHighRange: 1000, pressureLowRange: 0, pressureHighRange: 500};
  constructor(
    private airPropertiesService: AirPropertiesCsvService,
    private convertUnitsService: ConvertUnitsService,
  ) { }

  getSankeyResults(compressedAirAssessment: CompressedAirAssessment, CFMLeakSystem: number, dayTypeProfileSummaries: Array<ProfileSummary>): CompressedAirSankeyResults {
    let sankeyResults: CompressedAirSankeyResults = {
      compressorResults: [],
      CFMLeak_all_compressors: 0,
      kWInSystem: 0,
      kWAirSystem: 0,
      kWHeatOfcompressionSystem: 0,
      kWMechSystem: 0,
      kWLeakSystem: 0,
      kWTotalSystem: 0,
      CFM_sys: 0,
      systemPressure: 0,
      warnings: {
        CFMWarning: undefined,
      }
    };

    dayTypeProfileSummaries.forEach((summary, index: number) => {
      let compressorResults: SankeyCompressorResults = this.getSankeyCompressorResults(compressedAirAssessment, summary, index);
      sankeyResults.compressorResults.push(compressorResults);
    });

    sankeyResults.CFM_sys = sankeyResults.compressorResults.reduce((systemTotal, compressor) => {
      return systemTotal + compressor.CFM;
    }, 0);

    sankeyResults.systemPressure = sankeyResults.compressorResults.reduce((systemTotal, compressor) => systemTotal + compressor.systemPressure, 0);
    sankeyResults.systemPressure = sankeyResults.systemPressure / sankeyResults.CFM_sys;

    let CFM_by_compressor = sankeyResults.compressorResults.map(compressor => compressor.CFM);
    let denominatorSummedCompressors: number = 0;
    CFM_by_compressor.forEach((compr_cfm, cfmIndex) => {
      denominatorSummedCompressors += (compr_cfm * (sankeyResults.compressorResults[cfmIndex].pressure2 / sankeyResults.systemPressure));
    });

    let compressor_CFM_Warning: string = undefined;
    sankeyResults.compressorResults.forEach((compressor, index) => {
      // Block 3 calculated with system level pressure3 and t3
      let pressure3: number = sankeyResults.systemPressure;
      let t3: number = 75;
      let pressure4: number = compressor.pressure1 * 1.05;
      let eta_isen: number = 0.35;
      let eta_mech: number = .9;
      // T4 == temp at exit with starting value of t3 
      let t4: number = t3;

      let pressure3ConvertedPSIG: number = this.convertUnitsService.value(pressure3).from('psia').to('psig');
      if (sankeyResults.CFM_sys > 0) {
        let cp_3: number = this.getSpecificHeatConstantPressure(pressure3ConvertedPSIG, t3);
        // let cp_3: number = .2429
        let cp_4: number = this.getSpecificHeatConstantPressure(pressure4, t4);
        // let cp_4: number = .2403;
        let cv_3: number = this.getSpecificHeatConstantVolume(pressure3ConvertedPSIG, t3);
        let cv_4: number = this.getSpecificHeatConstantVolume(pressure4, t4);
        // let cv_4: number = .1714;
        let cp_e_avg: number = (cp_3 + cp_4) / 2;
        let cv_e_avg: number = (cv_3 + cv_4) / 2;

        let k_e: number = cp_e_avg / cv_e_avg;
        let base_eet: number = (pressure4 / pressure3);
        let exponent_eet: number = ((k_e - 1) / k_e);
        let calc_eet: number = Math.pow(base_eet, exponent_eet);
        t4 = t3 - eta_isen * t3 * (1 - calc_eet);
        let z_3: number = this.getCompressibilityFactor(pressure3ConvertedPSIG, t3);
        let z_4: number = this.getCompressibilityFactor(pressure4, t4);
        let Z_avg: number = (z_3 + z_4) / 2;
        let rho_3: number = this.getDensity(pressure3ConvertedPSIG, t3);
        
        // MW_a MolarMass 28.96 [lbm/lb-mole] Constant for air
        let MW_a: number = 28.96;
        let BHP_expansion: number = eta_isen * eta_mech * (1 / 33000) * (sankeyResults.CFM_sys * rho_3) * Z_avg * 1545 * t3 / MW_a * (k_e / (k_e - 1)) * (1 - calc_eet);
        let kWTotalSystem = BHP_expansion * 0.746;
        
        compressor.kWTotal = kWTotalSystem * ((compressor.systemPressure) / (sankeyResults.CFM_sys * sankeyResults.systemPressure));
        compressor.kWHeatOfCompression = compressor.kWComp - compressor.kWTotal;
        
        let numeratorCFMLeak: number = compressor.CFM * (compressor.pressure2 / sankeyResults.systemPressure);
        compressor.CFMLeak = CFMLeakSystem * (numeratorCFMLeak / denominatorSummedCompressors);
      } else {
        compressor_CFM_Warning = `Sankey was calculated with a compressor total airflow (CFM) of ${sankeyResults.CFM_sys}. Please check System Profile Setup data for correctness.`
      }
    });
    
    sankeyResults.warnings.CFMWarning = compressor_CFM_Warning;
    sankeyResults.kWInSystem = sankeyResults.compressorResults.reduce((systemTotal, compressor) => systemTotal + compressor.kWInput, 0);
    sankeyResults.kWTotalSystem = sankeyResults.compressorResults.reduce((systemTotal, compressor) => systemTotal + compressor.kWTotal, 0);
    sankeyResults.kWLeakSystem = (CFMLeakSystem / sankeyResults.CFM_sys) * sankeyResults.kWTotalSystem;
    sankeyResults.kWHeatOfcompressionSystem = sankeyResults.compressorResults.reduce((systemTotal, compressor) => systemTotal + compressor.kWHeatOfCompression, 0);
    sankeyResults.kWMechSystem = sankeyResults.compressorResults.reduce((systemTotal, compressor) => systemTotal + compressor.kWMech, 0);
    sankeyResults.kWAirSystem = sankeyResults.kWTotalSystem - sankeyResults.kWLeakSystem;

    return sankeyResults;
  }


  getSankeyCompressorResults(compressedAirAssessment: CompressedAirAssessment, summary: ProfileSummary, index?: number): SankeyCompressorResults {
    let currentCompressor: CompressorInventoryItem = compressedAirAssessment.compressorInventoryItems.find(compressor => compressor.itemId == summary.compressorId);
    // BLOCK 1 ==========================================
    let pressure1: number = compressedAirAssessment.systemInformation.atmosphericPressure;
    let pressure2: number;
    // Temperature one has no effect on results
    let temperature1: number = 75;
    let temperature2: number = temperature1;

    if (compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'targetPressureSequencer') {
      // this will be zero if field not modified. Add to setupDone?
      pressure2 = compressedAirAssessment.systemInformation.targetPressure;
    } else {
      pressure2 = currentCompressor.nameplateData.fullLoadOperatingPressure;
    }

    let pressure1ConvertedPSIG = this.convertUnitsService.value(pressure1).from('psia').to('psig');
    let cp_1 = this.getSpecificHeatConstantPressure(pressure1ConvertedPSIG, temperature1);
    let cv_1 = this.getSpecificHeatConstantVolume(pressure1ConvertedPSIG, temperature1);

    let CFM: number = summary.avgAirflow;
    let eta_poly: number = (0.027 * Math.log(CFM)) + 0.4984;

    // Initial air properties with temperature2 guess
    let cp_2 = this.getSpecificHeatConstantPressure(pressure2, temperature2);
    let cv_2 = this.getSpecificHeatConstantVolume(pressure2, temperature2);
    let cp_avg = (cp_1 + cp_2) / 2;
    let cv_avg = (cv_1 + cv_2) / 2;
    let k = cp_avg / cv_avg;
    //lowestDiff = smallest difference between left hand side and right hand side
    let currentLowestDiff: number = Infinity;
    //lowestDiffN = n corresponding to lowestDiff
    let lowestDiffN: number;
    let iterationValue: number = .001;
    let pressure2ConvertedPSIA = this.convertUnitsService.value(pressure2).from('psig').to('psia');
    let dt_poly: number;
    
    // Should three change here?
    let invalidLookupValue: number;
    let invalidValues = {
      cp_2: undefined, 
      cv_2: undefined,
    }
    for (let n = 0; n <= 3; n += iterationValue) {
      let LHS: number = n / (n - 1);
      let RHS: number = k / (k - 1) * eta_poly;
      
      let nDiff: number = Math.abs(LHS - RHS);
      if (nDiff < currentLowestDiff) {
        currentLowestDiff = nDiff;
        lowestDiffN = n;
        if (this.validTemperatureLookup(temperature2)) {
          cp_2 = this.getSpecificHeatConstantPressure(pressure2, temperature2);
          cv_2 = this.getSpecificHeatConstantVolume(pressure2, temperature2);
          cp_avg = (cp_1 + cp_2) / 2;
          cv_avg = (cv_1 + cv_2) / 2;
          k = cp_avg / cv_avg;
          
          let base: number = (pressure2ConvertedPSIA / pressure1);
          let exponent: number = (lowestDiffN - 1) / lowestDiffN;
          dt_poly = temperature1 * (Math.pow(base, exponent) - 1) / eta_poly;
          temperature2 = dt_poly + temperature1;
        } else {
          invalidLookupValue = temperature2;
          invalidValues.cp_2 = cp_2;
          invalidValues.cv_2 = cv_2;
        }
      }
    }


    // BLOCK 2 ========================================== 

    let kWInput: number = summary.avgPower;
    let kWMech: number = kWInput * (1 - (currentCompressor.designDetails.designEfficiency / 100));
    let kWComp = kWInput - kWMech;


    // BLOCK 3 ==========================================

    let compressorResults: SankeyCompressorResults = {
      kWInput: kWInput,
      kWLeak: 0,
      kWAir: 0,
      kWHeatOfCompression: 0,
      kWMech: kWMech,
      kWTotal: 0,
      kWComp: kWComp,
      CFMLeak: 0,
      CFM: CFM,
      systemPressure: pressure2ConvertedPSIA * CFM,
      pressure2: pressure2,
      pressure1: pressure1,
    }
    return compressorResults;
  }

  validTemperatureLookup(temperature: number) {
    return temperature >= this.airPropertiesLookupLimits.temperatureLowRange && temperature <= this.airPropertiesLookupLimits.temperatureHighRange;
  }

  validPressureLookup(pressure: number) {
    return pressure >= this.airPropertiesLookupLimits.pressureLowRange && pressure <= this.airPropertiesLookupLimits.pressureHighRange;
  }

  calculateAirPropertyFromInterpolation(airPropertyLowBound: number, airPropertyHighBound: number, interpolationProperty: InterpolationData): number {
    // Example using enthalpy
    // enthalpy = enthalpy low + ((enthalpy high – enthalpy low) / (val high – val low)) * (val – val low)
    let airPropertyResult = airPropertyLowBound + ((airPropertyHighBound - airPropertyLowBound) / (interpolationProperty.highBound - interpolationProperty.lowBound)) * (interpolationProperty.value - interpolationProperty.lowBound);
    return airPropertyResult;
  }

  calculateAirPropertyFromDoubleInterpolation(airPropertiesLookup: AirPropertiesLookup, lowLowAirProperty: number, highLowAirProperty: number, lowHighAirProperty: number, highHighAirProperty: number): number {
    let p: InterpolationData = airPropertiesLookup.doubleInterpolation.pressure;
    let t: InterpolationData = airPropertiesLookup.doubleInterpolation.temperature;

    let ratio: number = (p.highBound - p.lowBound) * (t.highBound - t.lowBound);
    // p.lowRangeAirProperty == property at low p and low t
    let lowPressureLowTemp: number = (((p.highBound - p.value) * (t.highBound - t.value)) / ratio) * lowLowAirProperty;
    // p.lowRangeAirProperty == property at high p and low t
    let highPressureLowTemp: number = (((p.value - p.lowBound) * (t.highBound - t.value)) / ratio) * highLowAirProperty;
    // p.lowRangeAirProperty == property at low p and high t
    let lowPressureHighTemp: number = (((p.highBound - p.value) * (t.value - t.lowBound)) / ratio) * lowHighAirProperty;
    // p.lowRangeAirProperty == property at high p and high t
    let highPressureHighTemp: number = (((p.value - p.lowBound) * (t.value - t.lowBound)) / ratio) * highHighAirProperty;

    let airPropertyResult: number = lowPressureLowTemp + highPressureLowTemp + lowPressureHighTemp + highPressureHighTemp;
   
    return airPropertyResult;
  }

  getSpecificHeatConstantPressure(pressure: number, temperature: number): number {
    let specificHeatConstantPressure: number;
    let airPropertiesLookup: AirPropertiesLookup = this.getAirPropertiesLookupData(pressure, temperature);
    
    if (airPropertiesLookup.result) { 
      specificHeatConstantPressure = airPropertiesLookup.result.c_p;
    } else if (airPropertiesLookup.singleInterpolation) {
      specificHeatConstantPressure = this.calculateAirPropertyFromInterpolation(
        airPropertiesLookup.singleInterpolation.lowRangeAirProperty.c_p, 
        airPropertiesLookup.singleInterpolation.highRangeAirProperty.c_p, 
        airPropertiesLookup.singleInterpolation);
    } else if (airPropertiesLookup.doubleInterpolation) {

        specificHeatConstantPressure = this.calculateAirPropertyFromDoubleInterpolation(
          airPropertiesLookup, 
          airPropertiesLookup.doubleInterpolation.pressure.lowRangeAirProperty.c_p, 
          airPropertiesLookup.doubleInterpolation.pressure.highRangeAirProperty.c_p, 
          airPropertiesLookup.doubleInterpolation.temperature.lowRangeAirProperty.c_p, 
          airPropertiesLookup.doubleInterpolation.temperature.highRangeAirProperty.c_p
          );
        }
        
    return specificHeatConstantPressure;
  }


  getSpecificHeatConstantVolume(pressure: number, temperature: number): number {
    let specificHeatConstantVolume: number;
    let airPropertiesLookup: AirPropertiesLookup = this.getAirPropertiesLookupData(pressure, temperature);
    if (airPropertiesLookup.result) { 
      specificHeatConstantVolume = airPropertiesLookup.result.c_v;
    } else if (airPropertiesLookup.singleInterpolation) {
      specificHeatConstantVolume = this.calculateAirPropertyFromInterpolation(
        airPropertiesLookup.singleInterpolation.lowRangeAirProperty.c_v, 
        airPropertiesLookup.singleInterpolation.highRangeAirProperty.c_v, 
        airPropertiesLookup.singleInterpolation);
    }  else if (airPropertiesLookup.doubleInterpolation) {
      specificHeatConstantVolume = this.calculateAirPropertyFromDoubleInterpolation(
        airPropertiesLookup, 
        airPropertiesLookup.doubleInterpolation.pressure.lowRangeAirProperty.c_v, 
        airPropertiesLookup.doubleInterpolation.pressure.highRangeAirProperty.c_v, 
        airPropertiesLookup.doubleInterpolation.temperature.lowRangeAirProperty.c_v, 
        airPropertiesLookup.doubleInterpolation.temperature.highRangeAirProperty.c_v
        );
    }
    return specificHeatConstantVolume;
  }

  getEnthalpy(pressure: number, temperature: number): number {
    let enthalpy: number;
    let airPropertiesLookup: AirPropertiesLookup = this.getAirPropertiesLookupData(pressure, temperature);

    if (airPropertiesLookup.result) { 
      enthalpy = airPropertiesLookup.result.enthalpy;
    } else if (airPropertiesLookup.singleInterpolation) {
      enthalpy = this.calculateAirPropertyFromInterpolation(airPropertiesLookup.singleInterpolation.lowRangeAirProperty.enthalpy, airPropertiesLookup.singleInterpolation.highRangeAirProperty.enthalpy, airPropertiesLookup.singleInterpolation);
    } else if (airPropertiesLookup.doubleInterpolation) {
      enthalpy = this.calculateAirPropertyFromDoubleInterpolation(
        airPropertiesLookup, 
        airPropertiesLookup.doubleInterpolation.pressure.lowRangeAirProperty.enthalpy, 
        airPropertiesLookup.doubleInterpolation.pressure.highRangeAirProperty.enthalpy, 
        airPropertiesLookup.doubleInterpolation.temperature.lowRangeAirProperty.enthalpy, 
        airPropertiesLookup.doubleInterpolation.temperature.highRangeAirProperty.enthalpy
        );
    }
    return enthalpy;
  }

  getDensity(pressure: number, temperature: number): number {
    let density: number;
    let airPropertiesLookup: AirPropertiesLookup = this.getAirPropertiesLookupData(pressure, temperature);
         
    if (airPropertiesLookup.result) { 
      density = airPropertiesLookup.result.density;
    } else if (airPropertiesLookup.singleInterpolation) {
      density = this.calculateAirPropertyFromInterpolation(airPropertiesLookup.singleInterpolation.lowRangeAirProperty.density, airPropertiesLookup.singleInterpolation.highRangeAirProperty.density, airPropertiesLookup.singleInterpolation);
    }  else if (airPropertiesLookup.doubleInterpolation) {
      density = this.calculateAirPropertyFromDoubleInterpolation(
        airPropertiesLookup, 
        airPropertiesLookup.doubleInterpolation.pressure.lowRangeAirProperty.density, 
        airPropertiesLookup.doubleInterpolation.pressure.highRangeAirProperty.density, 
        airPropertiesLookup.doubleInterpolation.temperature.lowRangeAirProperty.density, 
        airPropertiesLookup.doubleInterpolation.temperature.highRangeAirProperty.density
        );
    }
    return density;
  }

  getCompressibilityFactor(pressure: number, temperature: number): number {
    let compressibilityFactor: number;
    let airPropertiesLookup: AirPropertiesLookup = this.getAirPropertiesLookupData(pressure, temperature);
         
    if (airPropertiesLookup.result) { 
      compressibilityFactor = airPropertiesLookup.result.compressibilityFactor;
    } else if (airPropertiesLookup.singleInterpolation) {
      compressibilityFactor = this.calculateAirPropertyFromInterpolation(airPropertiesLookup.singleInterpolation.lowRangeAirProperty.compressibilityFactor, airPropertiesLookup.singleInterpolation.highRangeAirProperty.compressibilityFactor, airPropertiesLookup.singleInterpolation);
    }  else if (airPropertiesLookup.doubleInterpolation) {
      compressibilityFactor = this.calculateAirPropertyFromDoubleInterpolation(
        airPropertiesLookup, 
        airPropertiesLookup.doubleInterpolation.pressure.lowRangeAirProperty.compressibilityFactor, 
        airPropertiesLookup.doubleInterpolation.pressure.highRangeAirProperty.compressibilityFactor, 
        airPropertiesLookup.doubleInterpolation.temperature.lowRangeAirProperty.compressibilityFactor, 
        airPropertiesLookup.doubleInterpolation.temperature.highRangeAirProperty.compressibilityFactor
        );
    }
    return compressibilityFactor;
  }

  getAirPropertiesLookupData(pressure: number, temperature: number): AirPropertiesLookup {
    let airPropertiesLookup: AirPropertiesLookup = { result: undefined };
    let pressureInt = this.convertUnitsService.roundVal(pressure, 0);
    let temperatureInt = this.convertUnitsService.roundVal(temperature, 0);

    // TODO should round for this check
    let canLookupByPressure: boolean = this.checkIsTenMultiple(pressure);
    let canLookupByTemperature: boolean = this.checkIsTenMultiple(temperature);
    let interpolateBothInputs: boolean = !canLookupByPressure && !canLookupByTemperature;
    
    if (canLookupByPressure && canLookupByTemperature) {
      airPropertiesLookup.result = this.getAirPropertiesFromLookup(pressure, temperature);
    } else if (canLookupByTemperature) {
      airPropertiesLookup.singleInterpolation = this.setInterpolatedPressure(pressure, temperatureInt);
    } else if (canLookupByPressure) {
      airPropertiesLookup.singleInterpolation = this.setInterpolatedTemperature(pressureInt, temperature);
    } else if (interpolateBothInputs) {
      let temperatureLowBound = this.getLowBound(temperature);
      let temperatureHighBound = this.getHighBound(temperature);
      let pressureLowBound = this.getLowBound(pressure);
      let pressureHighBound = this.getHighBound(pressure);
      airPropertiesLookup.doubleInterpolation = {
        pressure: {
          lowBound: pressureLowBound,
          highBound: pressureHighBound,
          lowRangeAirProperty: this.airPropertiesService.airPropertiesData.find(row => row.pressure === pressureLowBound && row.temperature === temperatureLowBound),
          highRangeAirProperty: this.airPropertiesService.airPropertiesData.find(row => row.pressure === pressureHighBound && row.temperature === temperatureLowBound),
          value: pressure
        },
        temperature: {
          lowBound: temperatureLowBound,
          highBound: temperatureHighBound,
          lowRangeAirProperty: this.airPropertiesService.airPropertiesData.find(row => row.pressure === pressureLowBound && row.temperature === temperatureHighBound),
          highRangeAirProperty: this.airPropertiesService.airPropertiesData.find(row => row.pressure === pressureHighBound && row.temperature === temperatureHighBound),
          value: temperature
        }
      }
    }

    return airPropertiesLookup;
  }

  setInterpolatedPressure(pressure: number, temperatureInt: number): InterpolationData {
    let lowBound: number = this.getLowBound(pressure); 
    let highBound: number = this.getHighBound(pressure); 
    let interpolationData: InterpolationData = {
      lowBound: lowBound,
      highBound: highBound,
      lowRangeAirProperty: this.airPropertiesService.airPropertiesData.find(row => row.pressure === lowBound && row.temperature === temperatureInt),
      highRangeAirProperty: this.airPropertiesService.airPropertiesData.find(row => row.pressure === highBound && row.temperature === temperatureInt),
      value: pressure
    }
    return interpolationData;
  }

  setInterpolatedTemperature(pressureInt: number, temperature: number): InterpolationData {
    let lowBound: number = this.getLowBound(temperature); 
    let highBound: number = this.getHighBound(temperature); 
    let interpolationData: InterpolationData = {
      lowBound: lowBound,
      highBound: highBound,
      lowRangeAirProperty: this.airPropertiesService.airPropertiesData.find(row => row.pressure === pressureInt && row.temperature === lowBound),
      highRangeAirProperty: this.airPropertiesService.airPropertiesData.find(row => row.pressure === pressureInt && row.temperature === highBound),
      value: temperature
    }
    return interpolationData;
  }

  getAirPropertiesFromLookup(pressure: number, temperature: number): AirProperties {
    let airPropertiesData: AirProperties;
    this.airPropertiesService.airPropertiesData.forEach(entry => {
      if (entry.pressure == pressure && entry.temperature == temperature) {
        airPropertiesData = entry;
      }
    });
    return airPropertiesData;
  }

  getHighBound(value: number) {
    return Math.ceil(value / 10) * 10;
  }

  getLowBound(value: number) {
    return Math.floor(value / 10) * 10;
  }


  checkIsTenMultiple(value: number): boolean {
    return value % 10 === 0 || value === 0;
  }

  // TODO merge with existing sankey node from mroot
  createNode(name: string, value: number, displaySize: number, width: number, x: number, y: number, input: boolean, usefulOutput: boolean, inter: boolean, top: boolean, units: string, extSurfaceLoss: boolean, availableHeatPercent?: boolean): SankeyNode {
    let newNode: SankeyNode = {
      name: name,
      value: value,
      displaySize: displaySize,
      width: width,
      x: x,
      y: y,
      input: input,
      usefulOutput: usefulOutput,
      inter: inter,
      top: top,
      units: units,
    };

    return newNode;
  }

}

export interface SankeyNode {
  name: string;
  value: number;
  displaySize: number;
  width: number;
  x: number;
  y: number;
  input: boolean;
  usefulOutput: boolean;
  inter: boolean;
  top: boolean;
  units: string;
}


export interface CompressedAirSankeyNode {
  name: string,
  value: number,
  x: number,
  y: number,
  nodeColor: string,
  loss: number,
  source: number,
  target: number[],
  isConnector: boolean,
  isConnectingPath?: boolean,
  isCircularFlow?: boolean,
  id?: string,
}

export interface CompressedAirSankeyResults {
  compressorResults?: Array<SankeyCompressorResults>,
  kWInSystem: number,
  // Useful power deliverd through system
  kWAirSystem: number,
  // total heat of compression through system
  kWHeatOfcompressionSystem: number,
  // total mechanical losses through system
  kWMechSystem: number,
  // power lost due to air leaks through  system
  kWLeakSystem: number,
  kWTotalSystem: number,
  // Total volume delivered by all compressors in the system
  CFM_sys: number,
  CFMLeak_all_compressors: number,
  // Effective system pressure
  systemPressure: number,
  warnings: CompressedAirSankeyWarnings

}

export interface AirProperties {
  pressure?: number,
  temperature?: number,
  c_p: number;
  c_v: number;
  density: number;
  enthalpy: number;
  compressibilityFactor: number;
}

export interface AirPropertiesLookup {
  result?: AirProperties,
  singleInterpolation?: InterpolationData,
  doubleInterpolation?: {
    pressure: InterpolationData,
    temperature: InterpolationData,
  }
}

export interface InterpolationData {
    value?: number,
    lowBound: number,
    lowRangeAirProperty?: AirProperties,
    highBound: number,
    highRangeAirProperty?: AirProperties,
}


export interface SankeyCompressorResults {
  kWLeak: number,
  kWInput: number,
  kWAir: number,
  kWTotal: number,
  kWMech: number,
  kWHeatOfCompression: number,
  CFM: number,
  CFMLeak: number,
  systemPressure: number,
  pressure2: number,
  kWComp: number,
  pressure1: number,
  // individual compressor inputs for system level results
  // eta_isen: number,
  // eta_mech: number,
  // rho_3: number,
  // z_avg: number,
  // t3: number,
  // k_e: number,
  // calc_eet: number,
}


export interface SankeySystemInputs {
  CFMLeakSystem: number,
  selectedDayTypeId: string
}

export interface CompressedAirSankeyWarnings {
  CFMWarning: string;
}