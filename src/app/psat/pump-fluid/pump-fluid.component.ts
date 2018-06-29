import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { PsatService } from '../psat.service';
import { FluidProperties, PSAT, PsatInputs } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';
import { CompareService } from '../compare.service';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'app-pump-fluid',
  templateUrl: './pump-fluid.component.html',
  styleUrls: ['./pump-fluid.component.css']
})
export class PumpFluidComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Output('saved')
  saved = new EventEmitter<boolean>();
  @Output('isValid')
  isValid = new EventEmitter<boolean>();
  @Output('isInvalid')
  isInvalid = new EventEmitter<boolean>();
  @Input()
  selected: boolean;
  @Input()
  settings: Settings;
  @Input()
  baseline: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  modificationIndex: number;

  counter: any;

  formValid: boolean;
  pumpTypes: Array<string> = [
    'End Suction Slurry',
    'End Suction Sewage',
    'End Suction Stock',
    'End Suction Submersible Sewage',
    'API Double Suction',
    'Multistage Boiler Feed',
    'End Suction ANSI/API',
    'Axial Flow',
    'Double Suction',
    'Vertical Turbine',
    'Large End Suction',
    // When user selects below they need a way to provide the optimal efficiency
    // 'Specified Optimal Efficiency'
  ];

  drives: Array<string> = [
    'Direct Drive',
    'V-Belt Drive',
    'Notched V-Belt Drive',
    'Synchronous Belt Drive'
  ];

  fluidProperties = {
    'Acetone': { beta: 0.00079, tref: 77, density: 49, kinViscosity: 0.41, boiling: 132.89, melting: -138.5 },
    'Ammonia': { beta: 0.00136, tref: 77, density: 51.4, kinViscosity: 0.3, boiling: -28.01, melting: -107.91 },
    'Dichlorodifluoromethane refrigerant R-12': { beta: 0.00144, tref: 77, density: 81.8, kinViscosity: 0.198, boiling: -21.6, melting: -251.9 },
    'Ethanol': { beta: 0.00061, tref: 77, density: 49, kinViscosity: 1.52, boiling: 172.99, melting: -173.5 },
    'Ethylene glycol': { beta: 0.00032, tref: 77, density: 68.5, kinViscosity: 17.8, boiling: 387.1, melting: 8.8 },
    'Gasoline': { beta: 0.00053, tref: 60, density: 46, kinViscosity: 0.88, boiling: 258.9, melting: -70.9 },
    'Glycerine (glycerol)': { beta: 0.00028, tref: 77, density: 78.66, kinViscosity: 648, boiling: 554.0, melting: 64.0 },
    'Kerosene - jet fuel': { beta: 0.00055, tref: 60, density: 51.2, kinViscosity: 2.71, boiling: 572.0, melting: -10 },
    'Methanol': { beta: 0.00083, tref: 77, density: 49.1, kinViscosity: 0.75, boiling: 148.5, melting: -143.7 },
    'n-Octane': { beta: 0.00063, tref: 59, density: 43.6, kinViscosity: 1.266, boiling: 258.9, melting: -70.9 },
    'Petroleum': { beta: 0.00056, tref: 60, density: 44.4, kinViscosity: 0.198, boiling: 258.9, melting: -70.9 }
  };

  fluidTypes: Array<string> = [
    'Acetone',
    'Ammonia',
    'Dichlorodifluoromethane refrigerant R-12',
    'Ethanol',
    'Ethylene glycol',
    'Gasoline',
    'Glycerine (glycerol)',
    'Kerosene - jet fuel',
    'Methanol',
    'n-Octane',
    'Other',
    'Petroleum',
    'Water'
  ];
  psatForm: FormGroup;
  isFirstChange: boolean = true;
  rpmError: string = null;
  temperatureError: string = null;
  different: any = {
    pumpRPM: null
  };

  tempUnit: string;
  constructor(private psatService: PsatService, private compareService: CompareService, private helpPanelService: HelpPanelService, private convertUnitsService: ConvertUnitsService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.isFirstChange) {
      if (!this.selected) {
        this.disableForm();
      } else {
        this.enableForm();
      }
      if (changes.modificationIndex) {
        this.init();
      }
    }
    else {
      this.isFirstChange = false;
    }
  }

  ngOnInit() {
    this.init();
    if (this.settings.temperatureMeasurement == 'C') {
      this.tempUnit = '&#8451;';
    } else if (this.settings.temperatureMeasurement == 'F') {
      this.tempUnit = '&#8457;';
    }
    // } else if (this.settings.temperatureMeasurement == 'K') {
    //   this.tempUnit = '&#8490';
    // }
    if (!this.selected) {
      this.disableForm();
    }
  }

  init() {
    this.psatForm = this.psatService.getFormFromPsat(this.psat.inputs);
    this.checkForm(this.psatForm);
    this.checkPumpRpm(true);
  }

  disableForm() {
    this.psatForm.disable();
  }

  enableForm() {
    this.psatForm.enable();
  }

  addNum(str: string) {
    if (str == 'stages') {
      this.psatForm.patchValue({
        stages: this.psatForm.controls.stages.value + 1
      })
    }
    this.checkForm(this.psatForm);
    this.startSavePolling();
  }

  subtractNum(str: string) {
    if (str == 'stages') {
      if (this.psatForm.controls.stages.value != 0) {
        this.psatForm.patchValue({
          stages: this.psatForm.controls.stages.value - 1
        })
      }
    }
    this.checkForm(this.psatForm);
    this.startSavePolling();
  }

  focusField(str: string) {
    // if (str == 'fixedSpecificSpeed') {
    //   this.startSavePolling();
    // }
    this.helpPanelService.currentField.next(str);
    this.checkForm(this.psatForm);
  }

  checkForm(form: FormGroup) {
    this.formValid = this.psatService.isPumpFluidFormValid(form);
    if (this.formValid) {
      this.isValid.emit(true)
    } else {
      this.isInvalid.emit(true)
    }
  }

  savePsat(form: FormGroup) {
    this.psat.inputs = this.psatService.getPsatInputsFromForm(form);
    this.saved.emit(this.selected);
  }

  checkPumpRpm(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    let min = 1;
    let max = 0;
    if (this.psatForm.controls.drive.value === 'Direct Drive') {
      min = 540;
      max = 3960;
    } else {
      // TODO UPDATE WITH BELT DRIVE VALS
      max = Infinity;
    }
    this.rpmError = null;
    if (this.psatForm.controls.pumpRPM.value < min) {
      this.rpmError = 'Pump Speed is less than the minimum (' + min + ' rpm)';
    } else if (this.psatForm.controls.pumpRPM.value > max) {
      this.rpmError = 'Pump Speed is greater than the maximum (' + max + ' rpm)';
    }
  }

  checkTemperatureError(t: number, fluidType: string, boilingPoint?: number, meltingPoint?: number){
    this.temperatureError = null;
    if(fluidType == 'Water'){
      if (t > 212.0) {
        this.temperatureError = "Warning: Fluid Temperature is greater than the boiling point (212 deg F) at atmospheric pressure";
      } else if (t < 32.0) {
        this.temperatureError = "Warning: Fluid Temperature is less than the freezing point (32.0 deg F) at atmospheric pressure";
      }
    }else{
      if (t > boilingPoint) {
        this.temperatureError = "Warning: Fluid Temperature is greater than the boiling point (" + boilingPoint + " deg F) at atmospheric pressure";
      } else if (t < meltingPoint) {
        this.temperatureError = "Warning: Fluid Temperature is less than the freezing point (" + meltingPoint + " deg F) at atmospheric pressure";
      }
    }
  }

  calculateSpecificGravity() {
    let fluidType = this.psatForm.controls.fluidType.value;
    let t = this.psatForm.controls.fluidTemperature.value;
    t = this.convertUnitsService.value(t).from(this.settings.temperatureMeasurement).to('F');
    if (fluidType && t) {

      if (fluidType === 'Other') {
        return;
      }

      if (fluidType === 'Water') {
        this.checkTemperatureError(t, fluidType);
        let tTemp = (t - 32) * (5.0 / 9) + 273.15;
        let density = 0.14395 / Math.pow(0.0112, (1 + Math.pow(1 - tTemp / 649.727, 0.05107)));
        let kinViscosity = 0.000000003 * Math.pow(t, 4) - 0.000002 * Math.pow(t, 3) + 0.0005 * Math.pow(t, 2) - 0.0554 * t + 3.1271;
        this.psatForm.patchValue({
          gravity: this.psatService.roundVal((density / 1000), 3),
          viscosity: this.psatService.roundVal(kinViscosity, 3)
        });
      } else {
        let property = this.fluidProperties[fluidType];
        this.checkTemperatureError(t, fluidType, property.boiling, property.melting);
        let density = property.density / (1 + property.beta * (t - property.tref));
        this.psatForm.patchValue({
          gravity: this.psatService.roundVal((density / 62.428), 3),
          viscosity: this.psatService.roundVal(property.kinViscosity, 3)
        });
      }
    }
    this.startSavePolling();
  }


  startSavePolling() {
    this.checkForm(this.psatForm);
    this.savePsat(this.psatForm)
  }

  canCompare() {
    if (this.compareService.baselinePSAT && this.compareService.modifiedPSAT && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }

  isPumpSpecifiedDifferent() {
    if (this.canCompare()) {
      return this.compareService.isPumpSpecifiedDifferent();
    } else {
      return false;
    }
  }
  isPumpStyleDifferent() {
    if (this.canCompare()) {
      return this.compareService.isPumpStyleDifferent();
    } else {
      return false;
    }
  }
  isPumpRpmDifferent() {
    if (this.canCompare()) {
      return this.compareService.isPumpRpmDifferent();
    } else {
      return false;
    }
  }
  isDriveDifferent() {
    if (this.canCompare()) {
      return this.compareService.isDriveDifferent();
    } else {
      return false;
    }
  }
  isKinematicViscosityDifferent() {
    if (this.canCompare()) {
      return this.compareService.isKinematicViscosityDifferent();
    } else {
      return false;
    }
  }
  isSpecificGravityDifferent() {
    if (this.canCompare()) {
      return this.compareService.isSpecificGravityDifferent();
    } else {
      return false;
    }
  }
  isFluidTempDifferent() {
    if (this.canCompare()) {
      return this.compareService.isFluidTempDifferent();
    } else {
      return false;
    }
  }
  isFluidTypeDifferent() {
    if (this.canCompare()) {
      return this.compareService.isFluidTypeDifferent();
    } else {
      return false;
    }
  }

  isStagesDifferent() {
    if (this.canCompare()) {
      return this.compareService.isStagesDifferent();
    } else {
      return false;
    }
  }
}
