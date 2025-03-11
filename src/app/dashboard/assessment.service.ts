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
import { environment } from '../../environments/environment';

import { DashboardService } from './dashboard.service';
import { WaterAssessment } from '../shared/models/water-assessment';

@Injectable()
export class AssessmentService {

  workingAssessment: Assessment;
  startingTab: string;
  subTab: string;
  showLandingScreen: boolean = true;

  showTutorial: BehaviorSubject<string>;
  tutorialShown: boolean = false;
  constructor(private router: Router, private dashboardService: DashboardService) {
    this.showTutorial = new BehaviorSubject<string>(null);
  }

  goToAssessment(assessment: Assessment, mainTab?: string, subTab?: string) {
    if (mainTab) {
      this.startingTab = mainTab;
    } else {
      this.startingTab = 'system-setup';
    }

    if (subTab) {
      this.subTab = subTab;
    }

    let itemSegment: string;
    if (assessment.type === 'PSAT') {
      if (assessment.psat.setupDone && !mainTab && (!assessment.isExample)) {
        this.startingTab = 'assessment';
      }
      itemSegment = '/psat/';
    } else if (assessment.type === 'PHAST') {
      if (assessment.phast.setupDone && !mainTab && (!assessment.isExample)) {
        this.startingTab = 'assessment';
      }
      itemSegment = '/phast/';
    } else if (assessment.type === 'FSAT') {
      if (assessment.fsat.setupDone && !mainTab && !assessment.isExample) {
        this.startingTab = 'assessment';
      }
      itemSegment = '/fsat/';
    } else if (assessment.type === 'SSMT') {
      if (assessment.ssmt.setupDone && !mainTab && !assessment.isExample) {
        this.startingTab = 'assessment';
      }
      itemSegment = '/ssmt/';
    } else if (assessment.type == 'TreasureHunt') {
      if (assessment.treasureHunt.setupDone && !mainTab && !assessment.isExample) {
        this.startingTab = 'treasure-chest';
      }
      itemSegment = '/treasure-hunt/';
    } else if (assessment.type == 'WasteWater') {
      if (assessment.wasteWater.setupDone && !mainTab && !assessment.isExample) {
        this.startingTab = 'assessment';
      }
      itemSegment = '/waste-water/';
    } else if (assessment.type == 'CompressedAir') {
      if (assessment.compressedAirAssessment.setupDone && !mainTab && !assessment.isExample) {
        this.startingTab = 'assessment';
      }
      itemSegment = '/compressed-air/';
    } else if (assessment.type == 'Water') {
      if (assessment.water.setupDone && !mainTab && !assessment.isExample) {
        this.startingTab = 'assessment';
      }
      itemSegment = '/water/';
    }

    this.dashboardService.navigateWithSidebarOptions(itemSegment + assessment.id, {shouldCollapse: true})

  }

  getNewAssessment(assessmentType: string): Assessment {
    let newAssessment: Assessment = {
      name: null,
      createdDate: new Date(),
      modifiedDate: new Date(),
      type: assessmentType,
      appVersion: environment.version
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
        fuelCost: settings.fuelCost || 3.99,
        coalCarbonCost: .06,
        electrodeCost: 3,
        otherFuelCost: settings.fuelCost,
      },
      modifications: new Array()
    };
    return newPhast;
  }

  getWorkingAssessment(): Assessment {
    return this.workingAssessment;
  }

  getStartingTab() {
    return this.startingTab;
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

  setStartingTab(startingTab?: string) {
    this.startingTab = startingTab;
  }

  getNewFsat(settings: Settings): FSAT {
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
        cost: settings.electricityCost || .06,
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
        dryBulbTemp: 123,
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

  getNewSsmt(settings: Settings): SSMT {
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
        fuelCost: settings.fuelCost || 5.78,
        makeUpWaterCost: 0.03,
        electricityCost: settings.electricityCost || .05,
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
          isUserDefinedSo: true,
          influentCBODBefore: undefined,
          clarifierEfficiency: undefined,
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

  
  getNewWaterAssessment(settings: Settings): WaterAssessment {
    return {
      name: 'Baseline',
      modifications: new Array(),
      setupDone: false,
      systemBasics: {
        utilityType: 'Electricity',
        electricityCost: settings.electricityCost,
        notes: undefined,
        conductivityUnit: 'MuS/cm'
      },
      intakeSources: [],
      dischargeOutlets: [],
      waterUsingSystems: [],
      waterTreatments: [],
      wasteWaterTreatments: [],
      knownLosses: []
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
        atmosphericPressureKnown: true,
        plantMaxPressure: undefined,
        multiCompressorSystemControls: "cascading",
        trimSelections: [{
          dayTypeId: initDayTypeId,
          compressorId: undefined
        }]
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
      endUseData: {
        endUseDayTypeSetup: {
          selectedDayTypeId: undefined,
          dayTypeLeakRates: [],
        },
        dayTypeAirFlowTotals: undefined,
        endUses: new Array(),
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
