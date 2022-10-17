import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ElementRef, ViewChild, HostListener } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirReductionService } from '../compressed-air-reduction.service';
import { CompressedAirReductionResult, CompressedAirReductionData } from '../../../../shared/models/standalone';
import { OperatingHours } from '../../../../shared/models/operations';
import { ConvertCompressedAirReductionService } from '../convert-compressed-air-reduction.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-compressed-air-reduction-form',
  templateUrl: './compressed-air-reduction-form.component.html',
  styleUrls: ['./compressed-air-reduction-form.component.css']
})
export class CompressedAirReductionFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  data: CompressedAirReductionData;
  @Input()
  index: number;
  @Input()
  isBaseline: boolean;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<CompressedAirReductionData>();
  @Output('emitRemoveEquipment')
  emitRemoveEquipment = new EventEmitter<number>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  @Input()
  selected: boolean;
  @Input()
  utilityType: number;
  @Input()
  compressorControl: number;
  @Input()
  compressorControlAdjustment: number;
  @Input()
  compressorSpecificPowerControl: number;
  @Input()
  compressorSpecificPower: number;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  formWidth: number;
  showOperatingHoursModal: boolean;

  measurementOptions: Array<{ value: number, name: string }> = [
    { value: 0, name: 'Flow Meter' },
    { value: 1, name: 'Bag Method' },
    { value: 2, name: 'Orifice / Pressure Method' },
    { value: 3, name: 'Offsheet / Other Method' }
  ];
  utilityTypes: Array<{ value: number, name: string }> = [
    { value: 0, name: 'Compressed Air' },
    { value: 1, name: 'Electricity' }
  ];
  nozzleTypes: Array<{ value: number, name: string }> = [
    { value: 0, name: '1.0 mm nozzle' },
    { value: 1, name: '1.5 mm nozzle' },
    { value: 2, name: '1/4" pipe, open' },
    { value: 3, name: '1/4" tubing' },
    { value: 4, name: '1/8" pipe, open' },
    { value: 5, name: '1/8" tubing' },
    { value: 6, name: '2.0 mm nozzle' },
    { value: 7, name: '2.5 mm nozzle' },
    { value: 8, name: '3/8" pipe, open' },
    { value: 9, name: '3/8" tubing' },
    { value: 10, name: '5/16" tubing' },
    { value: 11, name: 'Air Knife' }
  ];
  compressorControls: Array<{ value: number, name: string, adjustment: number }> = [
    { value: 100, name: 'Screw Compressor - Inlet Modulation', adjustment: 30 },
    { value: 101, name: 'Screw Compressor - Variable Displacement', adjustment: 60 },
    { value: 102, name: 'Screw Compressor – Variable Speed Drives', adjustment: 97 },
    { value: 103, name: 'Oil Injected Screw - Load/Unload (short cycle)', adjustment: 48 },
    { value: 104, name: 'Oil Injected Screw - Load/Unload (2+ minutes cycle)', adjustment: 68 },
    { value: 105, name: 'Oil Free Screw - Load/Unload', adjustment: 73 },
    { value: 106, name: 'Reciprocating Compressor - Load/Unload', adjustment: 74 },
    { value: 107, name: 'Reciprocating Compressor - On/Off', adjustment: 100 },
    { value: 108, name: 'Centrifugal Compressor – In blowoff (Venting)', adjustment: 0 },
    { value: 109, name: 'Centrifugal – Modulating (IBV) in throttle range (Non-Venting)', adjustment: 67 },
    { value: 110, name: 'Centrifugal– Modulating (IGV) in throttle range (Non-Venting)', adjustment: 86 },
    { value: 8, name: 'Custom', adjustment: 0 }
  ];
  compressorSpecificPowerControls: Array<{ value: number, name: string, specificPower: number }> = [
    { value: 0, name: 'Reciprocating', specificPower: 0.16 },
    { value: 1, name: 'Rotary Screw (Lubricant-Injected)', specificPower: 0.20 },
    { value: 2, name: 'Rotary Screw (Lubricant-Free)', specificPower: 0.23 },
    { value: 3, name: 'Centrifugal', specificPower: 0.21 },
    { value: 4, name: 'Custom', specificPower: 0.0 }
  ];

  compressorCustomControl: boolean = false;
  compressorCustomSpecificPower: boolean = false;
  form: UntypedFormGroup;
  idString: string;
  individualResults: CompressedAirReductionResult;
  compressedAirResultsSub: Subscription;
  isEditingName: boolean = false;
  
  constructor(private compressedAirReductionService: CompressedAirReductionService, private convertCompressedAirReductionService: ConvertCompressedAirReductionService) { }

  ngOnInit() {
    if (this.isBaseline) {
      this.idString = 'baseline_' + this.index.toString();
    }
    else {
      this.idString = 'modification_' + this.index;
    }
    //previous 0.8.1 versions had nozzle type 12 with different color knife
    if (this.data.pressureMethodData.nozzleType == 12) {
      this.data.pressureMethodData.nozzleType = 11;
    }

    if (this.data.compressorElectricityData.compressorControl == 8) {
      this.compressorCustomControl = true;
    }
    this.form = this.compressedAirReductionService.getFormFromObj(this.data, this.index, this.isBaseline);
    if (this.selected == false) {
      this.form.disable();
    }

    this.compressedAirResultsSub = this.compressedAirReductionService.compressedAirResults.subscribe(results => {
      if (results) {
        if (this.isBaseline) {
          this.individualResults = results.baselineResults[this.index];
        } else {
          this.individualResults = results.modificationResults[this.index];
        }
      }
    });
  }

  ngOnDestroy() {
    this.compressedAirResultsSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.utilityType && !changes.utilityType.firstChange) {
      this.form.patchValue({ utilityType: this.utilityType });
    }

    if (changes.compressorControlAdjustment && !changes.compressorControlAdjustment.firstChange) {
      this.form.controls.compressorControlAdjustment.patchValue(this.compressorControlAdjustment);
    }

    if (changes.compressorControl && !changes.compressorControl.firstChange) {
      this.form.controls.compressorControl.patchValue(this.compressorControl);
      this.compressorCustomControl = (this.compressorControl == 8);
    }

    if (changes.compressorSpecificPowerControl && !changes.compressorSpecificPowerControl.firstChange) {
      this.form.controls.compressorSpecificPowerControl.patchValue(this.compressorSpecificPowerControl);
    }

    if (changes.compressorSpecificPower && !changes.compressorSpecificPower.firstChange) {
      this.form.controls.compressorSpecificPower.patchValue(this.compressorSpecificPower);
    }

    if (changes.selected && !changes.selected.firstChange) {
      if (this.selected == false) {
        this.form.disable();
      } else {
        this.form.enable();
        if (this.index != 0) {
          this.form.controls.utilityType.disable();
        }
        if (!this.isBaseline) {
          this.form.controls.compressorControl.disable();
          this.form.controls.compressorControlAdjustment.disable();
          // Compressor type
          this.form.controls.compressorSpecificPowerControl.disable();
        }
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  }

  changeCompressorType() {
    if (!this.compressorCustomSpecificPower) {
      if (this.form.controls.compressorSpecificPowerControl.value == 4) {
        this.compressorCustomSpecificPower = true;
      }
      let specificPower: number = this.getSpecificPower();
      this.form.patchValue({ compressorSpecificPower: specificPower });
    }
    else if (this.form.controls.compressorSpecificPowerControl.value != 4) {
      this.compressorCustomSpecificPower = false;
      let specificPower: number = this.getSpecificPower();
      this.form.patchValue({ compressorSpecificPower: specificPower });
    }
    else {
      if (this.form.controls.compressorSpecificPower.value) {
        this.compressorSpecificPowerControls[4].specificPower = this.form.controls.compressorSpecificPower.value;
      }
    }
    this.compressedAirReductionService.setValidators(this.form);
    this.calculate();
  }

  getSpecificPower(): number {
    let specificPower: number = this.compressorSpecificPowerControls[this.form.controls.compressorSpecificPowerControl.value].specificPower;

    if (this.settings.unitsOfMeasure != 'Imperial') {
      specificPower = this.convertCompressedAirReductionService.convertSpecificPower(specificPower);
      specificPower = this.convertCompressedAirReductionService.roundVal(specificPower);
    } else {
      specificPower = specificPower * 100;
    }
    return specificPower;
  }

  changeCompressorControl() {
    if (!this.compressorCustomControl) {
      if (this.form.controls.compressorControl.value == 8) {
        this.compressorCustomControl = true;
        let control = this.compressorControls.find(controlItem => { return controlItem.value == this.form.controls.compressorControl.value });
        this.form.patchValue({ compressorControlAdjustment: control.adjustment });
      }
      else {
        let control = this.compressorControls.find(controlItem => { return controlItem.value == this.form.controls.compressorControl.value });
        this.form.patchValue({ compressorControlAdjustment: control.adjustment });
      }
    }
    else if (this.form.controls.compressorControl.value !== 8) {
      this.compressorCustomControl = false;
      let control = this.compressorControls.find(controlItem => { return controlItem.value == this.form.controls.compressorControl.value });
      this.form.patchValue({ compressorControlAdjustment: control.adjustment });
    }
    else {
      if (this.form.controls.compressorControlAdjustment.valid) {
        //custom
        this.compressorControls[11].adjustment = this.form.controls.compressorControlAdjustment.value;
      }
    }
    this.compressedAirReductionService.setValidators(this.form);
    this.calculate();
  }

  changeUtilityType() {
    this.compressedAirReductionService.setValidators(this.form);
    this.calculate();
  }

  changeMeasurementMethod() {
    this.compressedAirReductionService.setValidators(this.form);
    this.calculate();
  }

  calculate() {
    let tmpObj: CompressedAirReductionData = this.compressedAirReductionService.getObjFromForm(this.form);
    this.emitCalculate.emit(tmpObj);
  }

  removeEquipment() {
    this.emitRemoveEquipment.emit(this.index);
  }

  editEquipmentName() {
    this.isEditingName = true;
  }

  doneEditingName() {
    this.isEditingName = false;
  }

  focusField(str: string) {
    this.emitChangeField.emit(str);
  }

  focusOut() {
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.compressedAirReductionService.operatingHours = oppHours;
    this.form.controls.hoursPerYear.patchValue(oppHours.hoursPerYear);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
