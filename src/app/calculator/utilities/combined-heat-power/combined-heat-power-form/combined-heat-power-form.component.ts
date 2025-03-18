import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CombinedHeatPower } from '../../../../shared/models/standalone';
import { CombinedHeatPowerService } from '../combined-heat-power.service';
import { OperatingHours } from '../../../../shared/models/operations';
import { Settings } from '../../../../shared/models/settings';
@Component({
    selector: 'app-combined-heat-power-form',
    templateUrl: './combined-heat-power-form.component.html',
    styleUrls: ['./combined-heat-power-form.component.css'],
    standalone: false
})
export class CombinedHeatPowerFormComponent implements OnInit {
  @Input()
  inputs: CombinedHeatPower;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  formWidth: number;
  showOperatingHoursModal: boolean;

  calculationOptions: any = [
    {
      name: 'Cost Avoided',
      value: 0,
    }, {
      name: 'Standby Rate',
      value: 1,
    }
  ];

  options: Array<string> = [
    'Cost Avoided',
    'Standby Rate'
  ];
  constructor(private combinedHeatPowerService: CombinedHeatPowerService) { }

  ngOnInit() {
  }

  ngAfterViewInit(){
    this.setOpHoursModalWidth();
  }

  calculate() {
    this.emitCalculate.emit(true);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  setCalculationOption() {
    if (this.inputs.option === 0) {
      this.inputs.percentAvgkWhElectricCostAvoidedOrStandbyRate = 75;
    } else if (this.inputs.option === 1) {
      this.inputs.percentAvgkWhElectricCostAvoidedOrStandbyRate = 0;
    }
    this.calculate();
  }

  closeOperatingHoursModal(){
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal(){
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours){
    this.combinedHeatPowerService.operatingHours = oppHours;
    this.inputs.annualOperatingHours = oppHours.hoursPerYear;
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth(){
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
