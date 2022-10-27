import { Component, OnInit, Input, Output, EventEmitter, HostListener, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirPressureReductionData, CompressedAirPressureReductionResult } from '../../../../shared/models/standalone';
import { UntypedFormGroup } from '@angular/forms';
import { CompressedAirPressureReductionService } from '../compressed-air-pressure-reduction.service';
import { OperatingHours } from '../../../../shared/models/operations';

@Component({
  selector: 'app-compressed-air-pressure-reduction-form',
  templateUrl: './compressed-air-pressure-reduction-form.component.html',
  styleUrls: ['./compressed-air-pressure-reduction-form.component.css']
})
export class CompressedAirPressureReductionFormComponent implements OnInit {
  @Input()
  index: number;
  @Input()
  settings: Settings;
  @Input()
  data: CompressedAirPressureReductionData;
  @Input()
  compressorPower: number;
  @Input()
  pressure: number;
  @Input()
  powerType: string;
  @Input()
  isBaseline: boolean;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<CompressedAirPressureReductionData>();
  @Output('emitRemoveEquipment')
  emitRemoveEquipment = new EventEmitter<number>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  @Input()
  selected: boolean;
  @Input()
  pressureRated: number;
  @Input()
  atmosphericPressure: number;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  formWidth: number;
  showOperatingHoursModal: boolean;

  form: UntypedFormGroup;
  idString: string;
  individualResults: CompressedAirPressureReductionResult;
  isEditingName: boolean = false;

  constructor(private compressedAirPressureReductionService: CompressedAirPressureReductionService) { }

  ngOnInit() {
    if (this.isBaseline) {
      this.idString = 'baseline_' + this.index.toString();
    }
    else {
      this.idString = 'modification_' + this.index;
    }
    this.form = this.compressedAirPressureReductionService.getFormFromObj(this.data, this.index, this.isBaseline);
    if (!this.isBaseline) {
      this.form.controls.compressorPower.disable();
      this.form.controls.powerType.disable();
    }
    if (this.selected == false) {
      this.form.disable();
    }
    this.calculateIndividualResult();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.isBaseline && changes.compressorPower && !changes.compressorPower.firstChange) {
      this.data.compressorPower = this.compressorPower;
      this.form.controls.compressorPower.patchValue(this.data.compressorPower);
      this.calculate();
    }
    if (!this.isBaseline && changes.pressure && !changes.pressure.firstChange) {
      this.data.pressure = this.pressure;
      this.form.controls.pressure.patchValue(this.data.pressure);
      this.calculate();
    }
    if (!this.isBaseline && changes.powerType && !changes.powerType.firstChange) {
      this.data.powerType = this.powerType;
      this.form.controls.powerType.patchValue(this.data.powerType);
      this.calculate();
    }

    if (!this.isBaseline && changes.atmosphericPressure && !changes.atmosphericPressure.firstChange) {
      this.data.atmosphericPressure = this.atmosphericPressure;
      this.form.controls.atmosphericPressure.patchValue(this.data.atmosphericPressure);
      this.calculate();
    }

    if (!this.isBaseline && changes.pressureRated && !changes.pressureRated.firstChange) {
      this.data.pressureRated = this.pressureRated;
      this.form.controls.pressureRated.patchValue(this.data.pressureRated);
      this.calculate();
    }
    if (changes.selected && !changes.selected.firstChange) {
      if (this.selected == false) {
        this.form.disable();
      } else {
        this.form.enable();
        if (!this.isBaseline) {
          this.form.controls.compressorPower.disable();
          this.form.controls.powerType.disable();
        }
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  }

  calculate() {
    let inputData: CompressedAirPressureReductionData = this.compressedAirPressureReductionService.getObjFromForm(this.form, this.isBaseline);
    if (inputData.powerType === 'Measured') {
      inputData.pressureRated = inputData.pressure;
    } 
    this.calculateIndividualResult();
    this.emitCalculate.emit(inputData);
  }

  removeEquipment() {
    this.emitRemoveEquipment.emit(this.index);
  }

  calculateIndividualResult() {
    let inputData: CompressedAirPressureReductionData = this.compressedAirPressureReductionService.getObjFromForm(this.form, this.isBaseline);
    if (inputData.powerType === 'Measured') {
      inputData.pressureRated = inputData.pressure;
    } 
    if(!this.isBaseline){
      inputData.pressure = inputData.proposedPressure;
    }
    this.individualResults = this.compressedAirPressureReductionService.calculateIndividualEquipment(inputData, this.settings);
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
    this.compressedAirPressureReductionService.operatingHours = oppHours;
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
