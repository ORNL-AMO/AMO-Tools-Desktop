import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, HostListener } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MotorDriveService } from '../motor-drive.service';
import { MotorDriveInputs } from '../../../../shared/models/calculators';
import { Settings } from '../../../../shared/models/settings';
import { OperatingHours } from '../../../../shared/models/operations';

@Component({
  selector: 'app-motor-drive-form',
  templateUrl: './motor-drive-form.component.html',
  styleUrls: ['./motor-drive-form.component.css']
})
export class MotorDriveFormComponent implements OnInit {
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<MotorDriveInputs>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  form: UntypedFormGroup;
  @Input()
  settings: Settings;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  formWidth: number;
  showOperatingHoursModal: boolean;


  // horsePowers: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1250, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000, 45000, 50000];

  driveTypes: Array<{ display: string, value: number }> = [
    { display: 'V Belt Drive', value: 0 },
    { display: 'Notched V Belt Drive', value: 1 },
    { display: 'Synchronous Belt Drive', value: 2 },
    { display: 'Direct Drive', value: 3 }
  ]
  constructor(private motorDriveService: MotorDriveService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  }

  calculate() {
    let data: MotorDriveInputs = this.motorDriveService.getObjFromForm(this.form);
    this.emitCalculate.emit(data);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.motorDriveService.operatingHours = oppHours;
    this.form.controls.annualOperatingHours.patchValue(oppHours.hoursPerYear);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
