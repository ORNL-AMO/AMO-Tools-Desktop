import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, HostListener } from '@angular/core';
import { DesignedEnergyElectricity } from '../../../shared/models/phast/designedEnergy';
import { OperatingHours } from '../../../shared/models/operations';
import { PhastService } from '../../phast.service';

@Component({
    selector: 'app-designed-energy-electricity-form',
    templateUrl: './designed-energy-electricity-form.component.html',
    styleUrls: ['./designed-energy-electricity-form.component.css'],
    standalone: false
})
export class DesignedEnergyElectricityFormComponent implements OnInit {
  @Input()
  inputs: DesignedEnergyElectricity;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

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
