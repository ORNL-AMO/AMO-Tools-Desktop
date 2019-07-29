import { Component, OnInit, Input, EventEmitter, Output, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { ReplaceExistingService } from '../replace-existing.service';
import { OperatingHours } from '../../../../shared/models/operations';
@Component({
  selector: 'app-replace-existing-form',
  templateUrl: './replace-existing-form.component.html',
  styleUrls: ['./replace-existing-form.component.css']
})
export class ReplaceExistingFormComponent implements OnInit {
  @Input()
  replaceExistingForm: FormGroup;
  @Input()
  settings: Settings;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  @Input()
  inTreasureHunt: boolean;
  
  @ViewChild('formElement') formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  formWidth: number;
  showOperatingHoursModal: boolean;
  constructor(private replaceExistingService: ReplaceExistingService) { }

  ngOnInit() {
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
    this.emitCalculate.emit(true);
  }


  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.replaceExistingService.operatingHours = oppHours;
    this.replaceExistingForm.controls.operatingHours.patchValue(oppHours.hoursPerYear);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
