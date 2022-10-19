import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { SteamReductionService } from '../steam-reduction.service';
import { SteamReductionResult, SteamReductionData } from '../../../../shared/models/standalone';
import { OperatingHours } from '../../../../shared/models/operations';

@Component({
  selector: 'app-steam-reduction-form',
  templateUrl: './steam-reduction-form.component.html',
  styleUrls: ['./steam-reduction-form.component.css']
})
export class SteamReductionFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  data: SteamReductionData;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<SteamReductionData>();
  @Output('emitRemoveEquipment')
  emitRemoveEquipment = new EventEmitter<number>();
  @Input()
  index: number;
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  @Input()
  isBaseline: boolean;
  @Input()
  selected: boolean;
  @Input()
  utilityType: number;
  @Input()
  utilityCost: number;

  formWidth: number;
  showOperatingHoursModal: boolean;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }


  measurementOptions: Array<{ value: number, name: string }> = [
    { value: 0, name: 'Flow Meter Method' },
    { value: 1, name: 'Mass Flow of Air' },
    { value: 2, name: 'Mass Flow of Water' },
    { value: 3, name: 'Offsheet / Other Method' }
  ];

  utilityOptions: Array<{ value: number, name: string }> = [
    { value: 0, name: 'Steam' },
    { value: 1, name: 'Natural Gas' },
    { value: 2, name: 'Other' }
  ];

  idString: string;
  individualResults: SteamReductionResult;
  isEditingName: boolean = false;
  form: UntypedFormGroup;

  constructor(private steamReductionService: SteamReductionService) { }

  ngOnInit() {
    if (this.isBaseline) {
      this.idString = 'baseline_' + this.index;
    }
    else {
      this.idString = 'modification_' + this.index;
    }
    this.form = this.steamReductionService.getFormFromObj(this.data, this.index, this.isBaseline);
    if (this.selected == false) {
      this.form.disable();
    }
    this.calculateIndividualResult();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.utilityType && !changes.utilityType.firstChange) {
      this.form.patchValue({ utilityType: this.utilityType });
      this.changeUtilityType();
    }
    if (changes.utilityCost && !changes.utilityCost.firstChange) {
      this.form.patchValue({ utilityCost: this.utilityCost });
    }

    if (changes.selected && !changes.selected.firstChange) {
      if (this.selected == false) {
        this.form.disable();
      } else {
        this.form.enable();
        if (this.index != 0 || !this.isBaseline) {
          this.form.controls.utilityType.disable();
          this.form.controls.utilityCost.disable();
        }
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  }

  changeMeasurementMethod() {
    this.steamReductionService.setValidators(this.form);
    this.calculate();
  }

  changeUtilityType() {
    let tmpCost;
    if (this.form.controls.utilityType.value == 0) {
      tmpCost = this.data.steamUtilityCost;
    }
    else if (this.form.controls.utilityType.value == 1) {
      tmpCost = this.data.naturalGasUtilityCost;
    }
    else {
      tmpCost = this.data.otherUtilityCost;
    }
    this.form.controls.utilityCost.setValue(tmpCost);
    this.calculate();
  }

  calculate() {
    let tmpObj = this.steamReductionService.getObjFromForm(this.form, this.data);
    this.data = tmpObj;
    this.calculateIndividualResult();
    this.emitCalculate.emit(tmpObj);
  }

  calculateIndividualResult() {
    this.individualResults = this.steamReductionService.calculateIndividualEquipment(this.data, this.settings);
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
    this.steamReductionService.operatingHours = oppHours;
    this.form.controls.operatingHours.patchValue(oppHours.hoursPerYear);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
