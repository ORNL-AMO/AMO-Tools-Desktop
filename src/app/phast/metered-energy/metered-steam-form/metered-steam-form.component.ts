import { Component, OnInit, Input, Output, EventEmitter, ViewChild, HostListener, ElementRef } from '@angular/core';
import { MeteredEnergySteam } from '../../../shared/models/phast/meteredEnergy';
import { Settings } from '../../../shared/models/settings';
import { PhastService } from '../../phast.service';
import { OperatingHours } from '../../../shared/models/operations';

@Component({
    selector: 'app-metered-steam-form',
    templateUrl: './metered-steam-form.component.html',
    styleUrls: ['./metered-steam-form.component.css'],
    standalone: false
})
export class MeteredSteamFormComponent implements OnInit {
  @Input()
  inputs: MeteredEnergySteam;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
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
