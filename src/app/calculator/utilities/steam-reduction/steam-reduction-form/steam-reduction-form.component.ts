import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
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

  formWidth: number;
  showOperatingHoursModal: boolean;

  @ViewChild('formElement') formElement: ElementRef;
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
  form: FormGroup;

  constructor(private steamReductionService: SteamReductionService) { }

  ngOnInit() {
    if (this.isBaseline) {
      this.idString = 'baseline_' + this.index;
    }
    else {
      this.idString = 'modification_' + this.index;
    }
    this.form = this.steamReductionService.getFormFromObj(this.data);
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
    this.steamReductionService.setValidators(this.form);
    this.calculate();
  }

  calculate() {
    let tmpObj: SteamReductionData = this.steamReductionService.getObjFromForm(this.form);
    this.calculateIndividualResult();
    this.emitCalculate.emit(tmpObj);
  }

  calculateIndividualResult() {
    let tmpObj: SteamReductionData = this.steamReductionService.getObjFromForm(this.form);
    console.log('tmpObj = ');
    console.log(tmpObj);
    this.individualResults = this.steamReductionService.calculateIndividualEquipment(tmpObj, this.settings);
    console.log('finish calculateIndividualResults()');
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
