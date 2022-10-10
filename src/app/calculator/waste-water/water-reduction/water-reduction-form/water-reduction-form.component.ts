import { Component, OnInit, EventEmitter, Input, Output, SimpleChanges, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { WaterReductionData, WaterReductionResult } from '../../../../shared/models/standalone';
import { WaterReductionService } from '../water-reduction.service';
import { UntypedFormGroup } from '@angular/forms';
import { OperatingHours } from '../../../../shared/models/operations';

@Component({
  selector: 'app-water-reduction-form',
  templateUrl: './water-reduction-form.component.html',
  styleUrls: ['./water-reduction-form.component.css']
})
export class WaterReductionFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  data: WaterReductionData;
  @Input()
  index: number;
  @Input()
  isBaseline: boolean;
  @Input()
  isWastewater: boolean;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<WaterReductionData>();
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

  measurementOptions: Array<{ value: number, name: string }> = [
    { value: 0, name: 'Metered Flow' },
    { value: 1, name: 'Volume Meter' },
    { value: 2, name: 'Bucket Method' },
    { value: 3, name: 'Offsheet / Other Method' }
  ];
  calculatorTypes: Array<{ value: boolean, name: string }> = [
    { value: false, name: 'Water' },
    { value: true, name: 'Wastewater' }
  ];

  form: UntypedFormGroup;
  idString: string;
  individualResults: WaterReductionResult;
  isEditingName: boolean = false;

  constructor(private waterReductionService: WaterReductionService) { }

  ngOnInit() {
    if (this.isBaseline) {
      this.idString = 'baseline_' + this.index.toString();
    }
    else {
      this.idString = 'modification_' + this.index;
    }
    this.form = this.waterReductionService.getFormFromObj(this.data, this.index, this.isBaseline);
    if (this.selected == false) {
      this.form.disable();
    }
    this.calculateIndividualResult();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.isWastewater && !changes.isWastewater.firstChange) {
      this.form.patchValue({ isWastewater: this.isWastewater })
    }
    if (changes.selected && !changes.selected.firstChange) {
      if (this.selected == false) {
        this.form.disable();
      } else {
        this.form.enable();
        if (this.index != 0 || !this.isBaseline) {
          this.form.controls.isWastewater.disable();
        }
      }
    }
  }

  ngAfterViewInit(){
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  }

  changeMeasurementMethod() {
    this.waterReductionService.setValidators(this.form);
    this.calculate();
  }

  changeCalculatorType() {
    this.waterReductionService.setValidators(this.form);
    this.calculate();
  }

  calculate() {
    let tmpObj: WaterReductionData = this.waterReductionService.getObjFromForm(this.form);
    this.calculateIndividualResult();
    this.emitCalculate.emit(tmpObj);
  }

  removeEquipment() {
    this.emitRemoveEquipment.emit(this.index);
  }

  calculateIndividualResult() {
    let tmpObj: WaterReductionData = this.waterReductionService.getObjFromForm(this.form);
    this.individualResults = this.waterReductionService.calculateIndividualEquipment(tmpObj, this.settings);
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

  closeOperatingHoursModal(){
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal(){
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours){
    this.waterReductionService.operatingHours = oppHours;
    this.form.controls.hoursPerYear.patchValue(oppHours.hoursPerYear);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth(){
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

}
