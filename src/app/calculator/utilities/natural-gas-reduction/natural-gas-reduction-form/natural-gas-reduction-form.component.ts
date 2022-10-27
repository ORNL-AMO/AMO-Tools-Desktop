import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild, HostListener, ElementRef } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { NaturalGasReductionService } from '../natural-gas-reduction.service';
import { NaturalGasReductionResult, NaturalGasReductionData } from '../../../../shared/models/standalone';
import { OperatingHours } from '../../../../shared/models/operations';

@Component({
  selector: 'app-natural-gas-reduction-form',
  templateUrl: './natural-gas-reduction-form.component.html',
  styleUrls: ['./natural-gas-reduction-form.component.css']
})
export class NaturalGasReductionFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  data: NaturalGasReductionData;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<NaturalGasReductionData>();
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

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  formWidth: number;
  showOperatingHoursModal: boolean;

  measurementOptions: Array<{ value: number, name: string }> = [
    { value: 0, name: 'Flow Meter Method' },
    { value: 1, name: 'Mass Flow of Air' },
    { value: 2, name: 'Mass Flow of Water' },
    { value: 3, name: 'Offsheet / Other Method' }
  ];
  idString: string;
  individualResults: NaturalGasReductionResult;
  isEditingName: boolean = false;
  form: UntypedFormGroup;

  constructor(private naturalGasReductionService: NaturalGasReductionService) { }

  ngOnInit() {
    if (this.isBaseline) {
      this.idString = 'baseline_' + this.index;
    }
    else {
      this.idString = 'modification_' + this.index;
    }
    this.form = this.naturalGasReductionService.getFormFromObj(this.data);
    if (this.selected == false) {
      this.form.disable();
    }
    this.calculateIndividualResult();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      if (this.selected == false) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  }

  changeMeasurementMethod() {
    this.naturalGasReductionService.setValidators(this.form);
    this.calculate();
  }

  calculate() {
    let tmpObj: NaturalGasReductionData = this.naturalGasReductionService.getObjFromForm(this.form);
    this.calculateIndividualResult();
    this.emitCalculate.emit(tmpObj);
  }

  calculateIndividualResult() {
    let tmpObj: NaturalGasReductionData = this.naturalGasReductionService.getObjFromForm(this.form);
    this.individualResults = this.naturalGasReductionService.calculateIndividualEquipment(tmpObj, this.settings);
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
    this.naturalGasReductionService.operatingHours = oppHours;
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
