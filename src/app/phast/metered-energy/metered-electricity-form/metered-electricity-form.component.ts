import { Component, OnInit, Input, Output, EventEmitter, ViewChild, HostListener, ElementRef } from '@angular/core';
import { MeteredEnergyElectricity } from '../../../shared/models/phast/meteredEnergy';
import { PhastService } from '../../phast.service';
import { OperatingHours } from '../../../shared/models/operations';

@Component({
    selector: 'app-metered-electricity-form',
    templateUrl: './metered-electricity-form.component.html',
    styleUrls: ['./metered-electricity-form.component.css'],
    standalone: false
})
export class MeteredElectricityFormComponent implements OnInit {
  @Input()
  inputs: MeteredEnergyElectricity;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  @Input()
  inCalc: boolean;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  showOperatingHoursModal: boolean = false;
  formWidth: number;
  constructor(private phastService: PhastService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.setOpHoursModalWidth();
  }
  changeField(str: string) {
    this.emitChangeField.emit(str);
  }

  calculate() {
    this.emitSave.emit(true);
    this.emitCalculate.emit(true);
  }
  openOperatingHoursModal() {
    this.phastService.modalOpen.next(true);
    this.showOperatingHoursModal = true;
  }

  closeOperatingHoursModal() {
    this.phastService.modalOpen.next(false);
    this.showOperatingHoursModal = false;
  }

  updateOperatingHours(newOppHours: OperatingHours) {
    this.inputs.operatingHoursCalc = newOppHours;
    this.inputs.operatingHours = newOppHours.hoursPerYear;
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

}
