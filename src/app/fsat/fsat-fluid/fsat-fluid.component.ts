import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Fsat203Service } from '../../calculator/fans/fsat-203/fsat-203.service';
import { FsatService } from '../fsat.service';
import { FormGroup } from '@angular/forms';
import { BaseGasDensity } from '../../shared/models/fans';
import { FsatFluidService } from './fsat-fluid.service';
import { Settings } from '../../shared/models/settings';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { CompareService } from '../compare.service';

@Component({
  selector: 'app-fsat-fluid',
  templateUrl: './fsat-fluid.component.html',
  styleUrls: ['./fsat-fluid.component.css']
})
export class FsatFluidComponent implements OnInit {
  @Input()
  baseGasDensity: BaseGasDensity;
  @Input()
  gasDone: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<BaseGasDensity>();
  @Input()
  inSetup: boolean;
  @Input()
  selected: boolean;
  @Input()
  modificationIndex: number;
  @Input()
  settings: Settings;

  gasDensityForm: FormGroup;

  methods: Array<{ display: string, value: string }> = [
    { display: 'Relative Humidity %', value: 'relativeHumidity' },
    { display: 'Wet Bulb Temperature', value: 'wetBulb' },
    { display: 'Gas Dew Point', value: 'dewPoint' },
    { display: 'Use Custom Density', value: 'custom' },
  ]

  gasTypes: Array<{ display: string, value: string }> = [
    { display: 'Air', value: 'AIR' },
    { display: 'Other Gas', value: 'OTHER' }
  ]
  //need error string for each warning (nameOfInputField + 'Error')
  //initialize to null
  barometricPressureError: string = null;
  dryBulbTempError: string = null;
  wetBulbTempError: string = null;
  staticPressureError: string = null;
  dewPointError: string = null;
  specificGravityError: string = null;
  relativeHumidityError: string = null;
  specificHeatGasError: string = null;
  constructor(private compareService: CompareService, private fsatService: FsatService, private fsatFluidService: FsatFluidService, private helpPanelService: HelpPanelService) { }

  ngOnInit() {
    this.init();
    if (!this.selected) {
      this.disableForm();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      if (this.selected) {
        this.enableForm();
      } else {
        this.disableForm();
      }
    }
    if (changes.modificationIndex && !changes.modificationIndex.firstChange) {
      this.init();
    }
  }

  init() {
    this.gasDensityForm = this.fsatFluidService.getGasDensityFormFromObj(this.baseGasDensity);
  }

  disableForm() {
    this.gasDensityForm.controls.gasType.disable();
    this.gasDensityForm.controls.inputType.disable();
    // this.chargeMaterialForm.disable();
  }

  enableForm() {
    this.gasDensityForm.controls.gasType.enable();
    this.gasDensityForm.controls.inputType.enable();
    // this.chargeMaterialForm.enable();
  }

  save() {
    //save is always called on input so add check for warnings call here
    this.checkForWarnings();
    this.baseGasDensity = this.fsatFluidService.getGasDensityObjFromForm(this.gasDensityForm);
    this.emitSave.emit(this.baseGasDensity);
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
  }

  checkForWarnings() {
    //const oneDecimalPlace = new RegExp('\d*(\.)?\d{0,1}');
    const oneDecimalPlace = new RegExp('\d+(\.?\d{0,3})');

    // const twoDecimalPlaces = new RegExp( '\d*(\.)?\d{0,2}');
    const twoDecimalPlaces = new RegExp('\d+(\.\d{0,2})?');

    // const threeDecimalPlaces = new RegExp('\d*(\.)?\d{0,3}');
    const threeDecimalPlaces = new RegExp('\d+(\.\d{0,3})?');

    // const fourDecimalPlaces = new RegExp('\d*(\.)?\d{0,4}');
    const fourDecimalPlaces = new RegExp('\d+(\.\d{0,4})?');


    //barometricPressure
    if (this.settings.unitsOfMeasure == 'Imperial') {
      //check in range
      if (this.gasDensityForm.controls.barometricPressure.value < 20) {
        this.barometricPressureError = 'Value must be greater than or equal to 20';
      } else if (this.gasDensityForm.controls.barometricPressure.value > 40) {
        this.barometricPressureError = 'Value must be less than or equal to 40';
      } else {
        //if no error set to null
        this.barometricPressureError = null;
      }


      //add additional checks for this form here if unitsOfMeasure dependent..
    } else {
      //need values for metric
      //add additional checks for this form here if unitsOfMeasure dependent..
    }

    //add non unitsOfMeasure checks here (% checks usually)

    //relativeHumidity
    if (this.gasDensityForm.controls.relativeHumidity.value < 0) {
      this.relativeHumidityError = 'Value must be greater than or equal to 0';
    } else if (this.gasDensityForm.controls.relativeHumidity.value > 100) {
      this.relativeHumidityError = 'Value must be less than or equal to 100';
    } else if (!oneDecimalPlace.test(this.gasDensityForm.controls.relativeHumidity.value.toString())) {
      this.relativeHumidityError = 'Value may not have more than one decimal place';
    } else {
      this.relativeHumidityError = null;
    }

    // //gasDensity
    // if (this.gasDensityForm.controls.gasDensity.value <= 0) {
    //   this.gasDensityError = 'Value must be greater than 0';
    // } else if (!fourDecimalPlaces.test(this.gasDensityForm.controls.gasDensity.value.toString())) {
    //   this.gasDensityError = 'Value may not have more than four decimal places';
    // } else {
    //   this.gasDensityError = null;
    // }

    //specificHeat
    if (this.gasDensityForm.controls.specificHeatGas.value <= 0) {
      this.specificHeatGasError = 'Value must be greater than 0';
    } else if (!threeDecimalPlaces.test(this.gasDensityForm.controls.specificHeatGas.value.toString())) {
      this.specificHeatGasError = 'Value may not have more than three decimal places';
    } else {
      this.specificHeatGasError = null;
    }
  }


  getDensity() {
    if (this.gasDensityForm.controls.inputType.value == 'relativeHumidity') {
      this.calcDensityRelativeHumidity();
    } else if (this.gasDensityForm.controls.inputType.value == 'wetBulb') {
      this.calcDensityWetBulb();
    } else if (this.gasDensityForm.controls.inputType.value == 'dewPoint') {
      this.calcDensityDewPoint();
    } else {
      this.save();
    }
  }

  calcDensityWetBulb() {
    let tmpObj: BaseGasDensity = this.fsatFluidService.getGasDensityObjFromForm(this.gasDensityForm);
    let newDensity: number = this.fsatService.getBaseGasDensityWetBulb(tmpObj);
    this.gasDensityForm.patchValue({
      gasDensity: newDensity
    })
    this.save();
  }

  calcDensityRelativeHumidity() {
    let tmpObj: BaseGasDensity = this.fsatFluidService.getGasDensityObjFromForm(this.gasDensityForm);
    let newDensity: number = this.fsatService.getBaseGasDensityRelativeHumidity(tmpObj);
    this.gasDensityForm.patchValue({
      gasDensity: newDensity
    })
    this.save();
  }

  calcDensityDewPoint() {
    let tmpObj: BaseGasDensity = this.fsatFluidService.getGasDensityObjFromForm(this.gasDensityForm);
    let newDensity: number = this.fsatService.getBaseGasDensityDewPoint(tmpObj);
    this.gasDensityForm.patchValue({
      gasDensity: newDensity
    })
    this.save();
  }


  canCompare() {
    if (this.compareService.baselineFSAT && this.compareService.modifiedFSAT && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }

  isDryBulbTempDifferent() {
    if (this.canCompare()) {
      return this.compareService.isDryBulbTempDifferent();
    } else {
      return false;
    }
  }
  isStaticPressureDifferent() {
    if (this.canCompare()) {
      return this.compareService.isStaticPressureDifferent();
    } else {
      return false;
    }
  }
  isBarometricPressureDifferent() {
    if (this.canCompare()) {
      return this.compareService.isBarometricPressureDifferent();
    } else {
      return false;
    }
  }
  isGasDensityDifferent() {
    if (this.canCompare()) {
      return this.compareService.isGasDensityDifferent();
    } else {
      return false;
    }
  }
  isGasTypeDifferent() {
    if (this.canCompare()) {
      return this.compareService.isGasTypeDifferent();
    } else {
      return false;
    }
  }
  isConditionLocationDifferent() {
    if (this.canCompare()) {
      return this.compareService.isConditionLocationDifferent();
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
  isInputTypeDifferent() {
    if (this.canCompare()) {
      return this.compareService.isInputTypeDifferent();
    } else {
      return false;
    }
  }
  isDewPointDifferent() {
    if (this.canCompare()) {
      return this.compareService.isDewPointDifferent();
    } else {
      return false;
    }
  }
  isRelativeHumidityDifferent() {
    if (this.canCompare()) {
      return this.compareService.isRelativeHumidityDifferent();
    } else {
      return false;
    }
  }
  isWetBulbTempDifferent() {
    if (this.canCompare()) {
      return this.compareService.isWetBulbTempDifferent();
    } else {
      return false;
    }
  }
  isSpecificHeatGasDifferent() {
    if (this.canCompare()) {
      return this.compareService.isSpecificHeatGasDifferent();
    } else {
      return false;
    }
  }


}
