import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges, ViewChild, HostListener, ElementRef } from '@angular/core';
import { ReplaceRewindData } from '../replace-rewind.component';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { ReplaceRewindService } from '../replace-rewind.service';

@Component({
  selector: 'app-replace-rewind-form',
  templateUrl: './replace-rewind-form.component.html',
  styleUrls: ['./replace-rewind-form.component.css']
})
export class ReplaceRewindFormComponent implements OnInit {
  @Input()
  inputs: ReplaceRewindData;
  @Input()
  isNewMotor: boolean;
  @Input()
  settings: Settings;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<ReplaceRewindData>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  @ViewChild('formElement') formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  formWidth: number;
  showOperatingHoursModal: boolean;

  form: FormGroup;

  constructor(private replaceRewindService: ReplaceRewindService) { }

  ngOnInit() {
    this.form = this.replaceRewindService.getFormFromObj(this.inputs, this.isNewMotor);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.inputs) {
      this.form = this.replaceRewindService.getFormFromObj(this.inputs, this.isNewMotor);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  }

  focusField(str: string) {
    this.emitChangeField.emit(str);
  }

  calculate() {
    this.inputs = this.replaceRewindService.getObjFromForm(this.form, this.isNewMotor);
    this.emitCalculate.emit(this.inputs);
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: number) {
    this.form.controls.operatingHours.patchValue(oppHours);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
