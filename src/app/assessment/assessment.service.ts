import { Injectable } from '@angular/core';
import { PSAT, PsatInputs } from '../shared/models/psat';
import { Assessment } from '../shared/models/assessment';
import { PHAST } from '../shared/models/phast/phast';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { FSAT } from '../shared/models/fans';
import { SSMT } from '../shared/models/steam/ssmt';
declare const packageJson;
@Injectable()
export class AssessmentService {

  workingAssessment: Assessment;
  tab: string;
  subTab: string;
  showLandingScreen: boolean = true;

  createAssessment: BehaviorSubject<boolean>;
  // checkForUpdates: BehaviorSubject<boolean>;
  updateAvailable: BehaviorSubject<boolean>;
  showTutorial: BehaviorSubject<string>;
  tutorialShown: boolean = false;
  dashboardView: BehaviorSubject<string>;
  workingDirectoryId: BehaviorSubject<number>;
  updateSidebarData: BehaviorSubject<boolean>;
  constructor(private router: Router) {
    this.createAssessment = new BehaviorSubject<boolean>(null);
    // this.checkForUpdates = new BehaviorSubject<boolean>(null);
    this.updateAvailable = new BehaviorSubject<boolean>(null);
    this.showTutorial = new BehaviorSubject<string>(null);
    this.dashboardView = new BehaviorSubject<string>('landing-screen');
    this.workingDirectoryId = new BehaviorSubject<number>(null);
    this.updateSidebarData = new BehaviorSubject<boolean>(null);
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
    if (assessment.type == 'PSAT') {
      if (assessment.psat.setupDone && !str && (!assessment.isExample)) {
        this.tab = 'assessment';
      }
      this.router.navigateByUrl('/psat/' + assessment.id);
    } else if (assessment.type == 'PHAST') {
      if (assessment.phast.setupDone && !str && (!assessment.isExample)) {
        this.tab = 'assessment';
      }
      this.router.navigateByUrl('/phast/' + assessment.id);
    } else if (assessment.type == 'FSAT') {
      if (assessment.fsat.setupDone && !str && !assessment.isExample) {
        this.tab = 'assessment';
      }
      this.router.navigateByUrl('/fsat/' + assessment.id);
    } else if (assessment.type == 'SSMT') {
      if (assessment.ssmt.setupDone && !str && !assessment.isExample) {
        this.tab = 'assessment';
      }
      this.router.navigateByUrl('/ssmt/' + assessment.id);

    }
  }

  getNewAssessment(assessmentType: string): Assessment {
    let newAssessment: Assessment = {
      name: null,
      createdDate: new Date(),
      modifiedDate: new Date(),
      type: assessmentType,
      appVersion: packageJson.version
    }
    return newAssessment;
  }

  getNewPsat(): PSAT {
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
      motor_rated_power: 200,
      motor_rated_speed: 1780,
      efficiency_class: 1,
      efficiency: 95,
      motor_rated_voltage: 460,
      load_estimation_method: 0,
      motor_rated_fla: null,
      operating_hours: 8760,
      flow_rate: null,
      head: 277,
      motor_field_power: null,
      motor_field_current: null,
      motor_field_voltage: 460,
      cost_kw_hour: null,
      fluidType: 'Water',
      fluidTemperature: 68
    };
    let newPsat: PSAT = {
      inputs: newPsatInputs
    };
    return newPsat;
  }

  getNewPhast(): PHAST {
    let newPhast: PHAST = {
      name: null,
      systemEfficiency: 90,
      operatingHours: {
        weeksPerYear: 52,
        daysPerWeek: 7,
        shiftsPerDay: 3,
        hoursPerShift: 8,
        hoursPerYear: 8736
      },
      operatingCosts: {
        fuelCost: 8.00,
        steamCost: 10.00,
        electricityCost: .080
      },
      modifications: new Array()
    }
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
        operatingHours: 8760,
        flowRate: null,
        inletPressure: null,
        outletPressure: null,
        loadEstimatedMethod: 0,
        motorPower: null,
        cost: null,
        compressibilityFactor: 0.988,
        specificHeatRatio: 1.4,
        measuredVoltage: 460
      },
      fanMotor: {
        lineFrequency: 60,
        motorRatedPower: null,
        motorRpm: 1785,
        efficiencyClass: 1,
        specifiedEfficiency: 100,
        motorRatedVoltage: 460,
        fullLoadAmps: null
      },
      fanSetup: {
        fanType: 0,
        fanSpeed: 1180,
        drive: 0
      },
      baseGasDensity: {
        dryBulbTemp: null,
        staticPressure: null,
        barometricPressure: 29.92,
        gasDensity: 0.0749,
        gasType: 'AIR',
        //Mark Additions
        inputType: 'custom',
        //Method 2 variables
        specificGravity: 1,
        wetBulbTemp: 119,
        relativeHumidity: 0,
        dewPoint: 0,
        specificHeatGas: .24
      },
      notes: {
        fieldDataNotes: '',
        fanMotorNotes: '',
        fanSetupNotes: '',
        fluidNotes: ''
      }
    }
    return newFsat;
  }

  getNewSsmt(): SSMT {
    return {
      name: '',
      setupDone: false,
      operatingHours: {
        weeksPerYear: 52,
        daysPerWeek: 7,
        shiftsPerDay: 3,
        hoursPerShift: 8,
        hoursPerYear: 8736
      },
      operatingCosts: {
        fuelCost: 5.78,
        makeUpWaterCost: 0,
        electricityCost: .05
      },
      generalSteamOperations: {
        sitePowerImport: 5000,
        makeUpWaterTemperature: 50
      },
      implementationCosts: 0.0,
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
      }
    }
  }
}