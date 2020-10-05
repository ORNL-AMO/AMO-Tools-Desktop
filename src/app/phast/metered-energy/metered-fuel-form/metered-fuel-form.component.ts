import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener } from '@angular/core';
import { MeteredEnergyFuel } from '../../../shared/models/phast/meteredEnergy';
import { SuiteDbService } from '../../../suiteDb/suite-db.service';
import { FlueGasMaterial } from '../../../shared/models/materials';
import { Settings } from '../../../shared/models/settings';
import { ConvertPhastService } from '../../convert-phast.service';
import { PhastService } from "../../phast.service";
import { OperatingHours } from '../../../shared/models/operations';

@Component({
  selector: 'app-metered-fuel-form',
  templateUrl: './metered-fuel-form.component.html',
  styleUrls: ['./metered-fuel-form.component.css']
})
export class MeteredFuelFormComponent implements OnInit {
  @Input()
  inputs: MeteredEnergyFuel;
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
  @Input()
  inElectricity: boolean;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  showOperatingHoursModal: boolean = false;
  formWidth: number;

  fuelTypes: FlueGasMaterial[];
  setMeteredEnergy: boolean;

  constructor(private suiteDbService: SuiteDbService, private convertPhastService: ConvertPhastService, private phastService: PhastService) { }

  ngOnInit() {
    this.getFuelTypes(true);
    this.calculate();
  }
  ngAfterViewInit() {
    this.setOpHoursModalWidth();
  }
  getFuelTypes(bool?: boolean) {
    if (this.inputs.fuelDescription === 'gas') {
      this.fuelTypes = this.suiteDbService.selectGasFlueGasMaterials();
    } else if (this.inputs.fuelDescription === 'solidLiquid') {
      this.fuelTypes = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
    }
    if (!bool) {
      this.inputs.fuelType = undefined;
      this.inputs.heatingValue = 0;
    }
  }

  changeField(str: string) {
    this.emitChangeField.emit(str);
  }

  showHideInputField() {
    this.inputs.userDefinedMeteredEnergy = !this.inputs.userDefinedMeteredEnergy;
    if (!this.inputs.userDefinedMeteredEnergy) {
      this.calculate();
    }
  }

  setProperties() {
    if (this.inputs.fuelDescription === 'gas') {
      let fuel = this.suiteDbService.selectGasFlueGasMaterialById(this.inputs.fuelType);
      if (this.settings.unitsOfMeasure === 'Metric') {
        fuel.heatingValueVolume = this.convertPhastService.convertVal(fuel.heatingValueVolume, 'btuSCF', 'kJNm3');
      }
      this.inputs.heatingValue = fuel.heatingValueVolume;
    } else {
      const fuel = this.suiteDbService.selectSolidLiquidFlueGasMaterialById(this.inputs.fuelType);
      let heatingVal = this.phastService.flueGasByMassCalculateHeatingValue(fuel);
      if (this.settings.unitsOfMeasure === 'Metric') {
        heatingVal = this.convertPhastService.convertVal(heatingVal, 'btuLb', 'kJkg');
      }
      this.inputs.heatingValue = heatingVal;
    }
    this.calculate();
  }

  setFlowRate() {
    this.inputs.fuelEnergy = this.inputs.fuelFlowRateInput * this.inputs.heatingValue * this.inputs.collectionTime / 1000000;
  }

  calculate() {
    if (!this.inputs.userDefinedMeteredEnergy) {
      this.setFlowRate();
    }
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
