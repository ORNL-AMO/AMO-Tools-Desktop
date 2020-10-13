import { Component, OnInit, Input, Output, EventEmitter, HostListener, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirPressureReductionData, CompressedAirPressureReductionResult } from '../../../../shared/models/standalone';
import { FormGroup } from '@angular/forms';
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
  isBaseline: boolean;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<CompressedAirPressureReductionData>();
  @Output('emitRemoveEquipment')
  emitRemoveEquipment = new EventEmitter<number>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  @Input()
  selected: boolean;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  formWidth: number;
  showOperatingHoursModal: boolean;

  form: FormGroup;
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
      if (!this.isBaseline) {
        this.data.compressorPower = this.compressorPower;
        this.data.pressure = this.pressure;
      }
    }

    this.form = this.compressedAirPressureReductionService.getFormFromObj(this.data, this.index, this.isBaseline);
    if (!this.isBaseline) {
      this.form.controls.compressorPower.disable();
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
    if (changes.selected && !changes.selected.firstChange) {
      if (this.selected == false) {
        this.form.disable();
      } else {
        this.form.enable();
        if (!this.isBaseline) {
          this.form.controls.compressorPower.disable();
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
    let tmpObj: CompressedAirPressureReductionData = this.compressedAirPressureReductionService.getObjFromForm(this.form, this.isBaseline);
    this.calculateIndividualResult();
    this.emitCalculate.emit(tmpObj);
  }

  removeEquipment() {
    this.emitRemoveEquipment.emit(this.index);
  }

  calculateIndividualResult() {
    let tmpObj: CompressedAirPressureReductionData = this.compressedAirPressureReductionService.getObjFromForm(this.form, this.isBaseline);
    this.individualResults = this.compressedAirPressureReductionService.calculateIndividualEquipment(tmpObj, this.settings);
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
