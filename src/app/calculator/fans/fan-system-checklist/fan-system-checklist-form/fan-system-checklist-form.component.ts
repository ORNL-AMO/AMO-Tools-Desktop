import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';
import { fanChecklistQuestions, FanSystemChecklistInput } from '../../../../shared/models/fans';
import { OperatingHours } from '../../../../shared/models/operations';
import { Settings } from '../../../../shared/models/settings';
import { FanSystemChecklistFormService } from '../fan-system-checklist-form.service';
import { FanSystemChecklistService } from '../fan-system-checklist.service';

@Component({
    selector: 'app-fan-system-checklist-form',
    templateUrl: './fan-system-checklist-form.component.html',
    styleUrls: ['./fan-system-checklist-form.component.css'],
    standalone: false
})
export class FanSystemChecklistFormComponent implements OnInit {
  @Input()
  index: number
  @Input()
  settings: Settings;
  @Input()
  inModal: boolean;
  @Input()
  headerHeight: number;
  @Input()
  operatingHours: OperatingHours;


  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }
  form: UntypedFormGroup;
  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  
  showOpHoursModal: boolean = false;
  displayNotes: boolean = false;
  formWidth: number;
  isCollapsed: boolean = false;
  checklistQuestions: {[key: string]: string};
  productionStateOptions: Array<{value: number, display: string}> = [
    {display: 'No', value: 0},
    {display: 'Yes', value: 1},
    {display: 'Severe', value: 2},
  ];

  constructor(private fanSystemChecklistService: FanSystemChecklistService, 
              private fanSystemChecklistFormService: FanSystemChecklistFormService) { }

  ngOnInit() {
    this.checklistQuestions = fanChecklistQuestions;
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.resetDataSub = this.fanSystemChecklistService.resetData.subscribe(value => {
      this.initForm();
    })
    this.generateExampleSub = this.fanSystemChecklistService.generateExample.subscribe(value => {
      this.initForm();
    })
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  } 

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
  }

  initForm() {
    let fanSystemChecklistInput: Array<FanSystemChecklistInput> = this.fanSystemChecklistService.fanSystemChecklistInputs.getValue();
    this.form = this.fanSystemChecklistFormService.getFanSystemChecklistForm(fanSystemChecklistInput[this.index]);
  }
  
  removeEquipment() {
    if (this.index > 0) {
      this.fanSystemChecklistService.removeEquipment(this.index);
    }
  }

  focusField(str: string) {
    this.fanSystemChecklistService.currentField.next(str);
  }

  calculate() {
    let updatedInput: FanSystemChecklistInput = this.fanSystemChecklistFormService.getFanSystemChecklistInput(this.form);
    this.fanSystemChecklistService.updateInputsArray(updatedInput, this.index);
  }

  setFormControlRadioValue(controlName: string, value: string) {
    this.form.get(controlName).patchValue(value);
    this.calculate();
  }
  
  setFormControlCheckbox(event, controlName: string) {
    let value: number = Number(event.target.checked);
    this.form.get(controlName).patchValue(value);
    this.calculate();
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleNotes() {
    this.displayNotes = !this.displayNotes;
  }

  closeOperatingHoursModal() {
    this.showOpHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOpHoursModal = true;
  }

  updateOperatingHours(operatingHours: OperatingHours) {
    this.showOpHoursModal
    this.form.controls.operatingHours.patchValue(operatingHours.hoursPerYear);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

}