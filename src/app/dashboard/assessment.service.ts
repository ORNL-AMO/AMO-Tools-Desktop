import { Injectable } from '@angular/core';
import { PSAT, PsatInputs } from '../shared/models/psat';
import { Assessment } from '../shared/models/assessment';
import { PHAST } from '../shared/models/phast/phast';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { FSAT } from '../shared/models/fans';
import { SSMT } from '../shared/models/steam/ssmt';
import { WasteWater } from '../shared/models/waste-water';
import { Settings } from '../shared/models/settings';
import { CompressedAirAssessment } from '../shared/models/compressed-air-assessment';

declare const packageJson;
@Injectable()
export class AssessmentService {

  workingAssessment: Assessment;
  tab: string;
  subTab: string;
  showLandingScreen: boolean = true;

  updateAvailable: BehaviorSubject<boolean>;
  showTutorial: BehaviorSubject<string>;
  tutorialShown: boolean = false;
  constructor(private router: Router) {
    this.updateAvailable = new BehaviorSubject<boolean>(null);
    this.showTutorial = new BehaviorSubject<string>(null);
  }

  goToAssessment(assessment: Assessment, str?: string, str2?: string) {
    if (str) {
      this.tab = str;
    } else {
      this.tab = 'system-setup';
    }

    if (str2) {
      this.subTab = str2;
    }
    if (assessment.type === 'PSAT') {
      if (assessment.psat.setupDone && !str && (!assessment.isExample)) {
        this.tab = 'assessment';
      }
      this.router.navigateByUrl('/psat/' + assessment.id);
    } else if (assessment.type === 'PHAST') {
      if (assessment.phast.setupDone && !str && (!assessment.isExample)) {
        this.tab = 'assessment';
      }
      this.router.navigateByUrl('/phast/' + assessment.id);
    } else if (assessment.type === 'FSAT') {
      if (assessment.fsat.setupDone && !str && !assessment.isExample) {
        this.tab = 'assessment';
      }
      this.router.navigateByUrl('/fsat/' + assessment.id);
    } else if (assessment.type === 'SSMT') {
      if (assessment.ssmt.setupDone && !str && !assessment.isExample) {
        this.tab = 'assessment';
      }
      this.router.navigateByUrl('/ssmt/' + assessment.id);
    } else if (assessment.type == 'TreasureHunt') {
      if (assessment.treasureHunt.setupDone && !str && !assessment.isExample) {
        this.tab = 'treasure-chest';
      }
      this.router.navigateByUrl('/treasure-hunt/' + assessment.id);
    } else if (assessment.type == 'WasteWater') {
      if (assessment.wasteWater.setupDone && !str && !assessment.isExample) {
        this.tab = 'assessment';
      }
      this.router.navigateByUrl('/waste-water/' + assessment.id);
    } else if (assessment.type == 'CompressedAir') {
      if (assessment.compressedAirAssessment.setupDone && !str && !assessment.isExample) {
        this.tab = 'assessment';
      }
      this.router.navigateByUrl('/compressed-air/' + assessment.id);
    }
  }

  getNewAssessment(assessmentType: string): Assessment {
    let newAssessment: Assessment = {
      name: null,
      createdDate: new Date(),
      modifiedDate: new Date(),
      type: assessmentType,
      appVersion: packageJson.version
    };
    return newAssessment;
  }

  getNewPsat(settings: Settings): PSAT {
    let newPsatInputs: PsatInputs = {
      pump_style: 6,
      pump_specified: null,
      pump_rated_speed: 1780,
      drive: 0,
      kinematic_viscosity: 1.107,
      specific_gravity: 1.002,
      stages: 1,
      fixed_speed: 0,
      line_frequency: 60,
      motor_rated_power: null,
      motor_rated_speed: null,
      efficiency_class: 1,
      efficiency: 95,
      motor_rated_voltage: 460,
      load_estimation_method: 0,
      motor_rated_fla: null,
      operating_hours: 8760,
      flow_rate: null,
      head: null,
      motor_field_power: null,
      motor_field_current: null,
      motor_field_voltage: 460,
      cost_kw_hour: settings.electricityCost,
      fluidType: 'Water',
      fluidTemperature: 68
    };
    let newPsat: PSAT = {
      inputs: newPsatInputs
    };
    if (settings.powerMeasurement !== 'hp') {
      newPsat.inputs.motor_rated_power = 150;
    }
    return newPsat;
  }

  getNewPhast(settings: Settings): PHAST {
    let newPhast: PHAST = {
      name: null,
      systemEfficiency: 90,
      operatingHours: {
        weeksPerYear: 52,
        daysPerWeek: 7,
        // shiftsPerDay: 3,
        // hoursPerShift: 8,
        hoursPerYear: 8760
      },
      operatingCosts: {
        electricityCost: settings.electricityCost || .066,
        steamCost: settings.steamCost || 4.69,
        fuelCost: settings.fuelCost || 3.99
      },
      modifications: new Array()
    };
    return newPhast;
  }

  getWorkingAssessment(): Assessment {
    return this.workingAssessment;
  }

  getTab() {
    return this.tab;
  }

  getSubTab() {
    return this.subTab;
  }

  getLandingScreen() {
    return this.showLandingScreen;
  }

  setLandingScreen(bool: boolean) {
    this.showLandingScreen = bool;
  }

  setWorkingAssessment(assessment: Assessment, str?: string) {
    this.tab = str;
    this.workingAssessment = assessment;
  }

  getNewFsat(): FSAT {
    let newFsat: FSAT = {
      fieldData: {
        
        flowRate: null,
        inletPressure: null,
        inletVelocityPressure: null,
        outletPressure: null,
        usingStaticPressure: true,
        loadEstimatedMethod: 0,
        motorPower: null,
       
        compressibilityFactor: 0.988,
        measuredVoltage: 460
      },
      fsatOperations: {
        operatingHours: 8760,
        cost: null,
        cO2SavingsData: null
      },
      fanMotor: {
        lineFrequency: 60,
        motorRatedPower: null,
        motorRpm: null,
        efficiencyClass: 1,
        specifiedEfficiency: 100,
        motorRatedVoltage: 460,
        fullLoadAmps: null
      },
      fanSetup: {
        fanType: 0,
        fanSpeed: null,
        drive: 0
      },
      baseGasDensity: {
        dryBulbTemp: 68,
        staticPressure: 0,
        barometricPressure: 29.92,
        gasDensity: 0.0749,
        gasType: 'AIR',
        //Mark Additions
        inputType: 'relativeHumidity',
        //Method 2 variables
        specificGravity: 1,
        wetBulbTemp: 119,
        relativeHumidity: 0,
        dewPoint: 0,
        specificHeatGas: .24,
        specificHeatRatio: 1.4,
      },
      notes: {
        fieldDataNotes: '',
        fanMotorNotes: '',
        fanSetupNotes: '',
        fluidNotes: ''
      }
    };
    return newFsat;
  }

  getNewSsmt(): SSMT {
    return {
      name: '',
      setupDone: false,
      operatingHours: {
        weeksPerYear: 52.14,
        daysPerWeek: 7,
        hoursPerDay: 24,
        minutesPerHour: 60,
        secondsPerMinute: 60,
        hoursPerYear: 8760
      },
      operatingCosts: {
        fuelCost: 5.78,
        makeUpWaterCost: 0.03,
        electricityCost: .05,
        implementationCosts: 0.0
      },
      generalSteamOperations: {
        sitePowerImport: undefined,
        makeUpWaterTemperature: 50
      },
      equipmentNotes: '',
      turbineInput: {
        condensingTurbine: {
          isentropicEfficiency: undefined,
          generationEfficiency: undefined,
          condenserPressure: undefined,
          operationType: 0,
          operationValue: undefined,
          useTurbine: false
        },
        highToLowTurbine: {
          isentropicEfficiency: undefined,
          generationEfficiency: undefined,
          operationType: 0,
          operationValue1: undefined,
          operationValue2: undefined,
          useTurbine: false
        },
        highToMediumTurbine: {
          isentropicEfficiency: undefined,
          generationEfficiency: undefined,
          operationType: 0,
          operationValue1: undefined,
          operationValue2: undefined,
          useTurbine: false
        },
        mediumToLowTurbine: {
          isentropicEfficiency: undefined,
          generationEfficiency: undefined,
          operationType: 0,
          operationValue1: undefined,
          operationValue2: undefined,
          useTurbine: false
        }
      },
      headerInput: {
        numberOfHeaders: 1,
        highPressureHeader: undefined,
        mediumPressureHeader: undefined,
        lowPressureHeader: undefined
      }
    };
  }

  getNewWasteWater(settings: Settings): WasteWater {
    return {
      baselineData: {
        name: 'Baseline',
        id: Math.random().toString(36).substr(2, 9),
        activatedSludgeData: {
          Temperature: undefined,
          So: undefined,
          Volume: undefined,
          FlowRate: undefined,
          InertVSS: undefined,
          OxidizableN: undefined,
          Biomass: undefined,
          InfluentTSS: undefined,
          InertInOrgTSS: undefined,
          EffluentTSS: undefined,
          RASTSS: undefined,
          MLSSpar: undefined,
          CalculateGivenSRT: false,
          DefinedSRT: undefined,
          BiomassYeild: 0.6,
          HalfSaturation: 60,
          FractionBiomass: 0.1,
          MicrobialDecay: 0.1,
          MaxUtilizationRate: 8,
        },
        aeratorPerformanceData: {
          OperatingDO: undefined,
          Alpha: .84,
          Beta: .92,
          Aerator: 'Ultra-fine bubble diffusers',
          SOTR: undefined,
          Aeration: undefined,
          Elevation: undefined,
          OperatingTime: 24,
          TypeAerators: 2,
          Speed: 100,
          AnoxicZoneCondition: false
        },
        operations: {
          MaxDays: 100,
          TimeIncrement: .5,
          operatingMonths: 12,
          EnergyCostUnit: settings.electricityCost
        }
      },
      modifications: new Array(),
      systemBasics: {
        equipmentNotes: ''
      }
    }
  }

  getNewCompressedAirAssessment(settings: Settings): CompressedAirAssessment {
    let initDayTypeId: string = Math.random().toString(36).substr(2, 9);
    return {
      name: 'Baseline',
      modifications: new Array(),
      setupDone: false,
      systemBasics: {
        utilityType: 'Electricity',
        electricityCost: settings.electricityCost,
        demandCost: 5.00,
        notes: undefined
      },
      systemInformation: {
        systemElevation: undefined,
        totalAirStorage: undefined,
        isSequencerUsed: false,
        targetPressure: undefined,
        variance: undefined,
        atmosphericPressure: 14.7,
        atmosphericPressureKnown: true
      },
      compressorInventoryItems: new Array(),
      systemProfile: {
        systemProfileSetup: {
          dayTypeId: undefined,
          numberOfHours: 24,
          dataInterval: 1,
          profileDataType: undefined,
        },
        profileSummary: new Array()
      },
      compressedAirDayTypes: [{
        dayTypeId: initDayTypeId,
        name: 'Standard Day Type',
        numberOfDays: 365,
        profileDataType: "percentCapacity"
      }]
    }
  }

}
