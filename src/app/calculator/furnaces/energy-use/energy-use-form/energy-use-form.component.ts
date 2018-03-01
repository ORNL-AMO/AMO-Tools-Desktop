import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';
import {SuiteDbService} from '../../../../suiteDb/suite-db.service';
import {Settings} from '../../../../shared/models/settings';
import {FlowCalculations, FlowCalculationsOutput} from '../../../../shared/models/phast/flowCalculations';
import {ConvertUnitsService} from "../../../../shared/convert-units/convert-units.service";

@Component({
  selector: 'app-energy-use-form',
  templateUrl: './energy-use-form.component.html',
  styleUrls: ['./energy-use-form.component.css']
})
export class EnergyUseFormComponent implements OnInit {
  @Input()
  flowCalculations: FlowCalculations;
  @Input()
  flowCalculationResults: FlowCalculationsOutput;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  inPhast: boolean;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;

  sectionOptions: any = [
    {
      name: 'Square Edge',
      value: 0,
      dischargeCoefficient: .5
    }, {
      name: 'Sharp Edge',
      value: 1,
      dischargeCoefficient: .6
    },
    {
      name: 'Venturi',
      value: 2,
      dischargeCoefficient: .8
    }
  ]


  gasType: any = [
    {
      name: 'Natural Gas',
      value: 0,
    }, {
      name: 'Oxygen',
      value: 1,
    }, {
      name: 'Nitrogen',
      value: 2,
    }, {
      name: 'Hydrogen',
      value: 3,
    }, {
      name: 'Carbon Dioxide',
      value: 4,
    }, {
      name: 'Air',
      value: 5,
    }, {
      name: 'Other',
      value: 6,
    }
  ]

  constructor(private suiteDbService: SuiteDbService, private convertUnitsService: ConvertUnitsService) {
  }

  ngOnInit() {
    //this.gasTypeOptions = this.suiteDbService.selectGasFlueGasMaterials();
  }

  calculate() {
    this.emitCalculate.emit(true);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  setDischargeCoefficient() {
    if (this.flowCalculations.sectionType == 0) {
      this.flowCalculations.dischargeCoefficient = .5;
    } else if (this.flowCalculations.sectionType == 1) {
      this.flowCalculations.dischargeCoefficient = .6;
    } else if (this.flowCalculations.sectionType == 2) {
      this.flowCalculations.dischargeCoefficient = .8;
    }
    this.calculate();
  }

  setHHVandSG() {
    if (this.flowCalculations.gasType == 0) {
      this.flowCalculations.gasHeatingValue = 22031;
      this.flowCalculations.specificGravity = 0.657;
    } else if (this.flowCalculations.gasType == 1) {
      this.flowCalculations.gasHeatingValue = 0;
      this.flowCalculations.specificGravity = 1.1044;
    } else if (this.flowCalculations.gasType == 2) {
      this.flowCalculations.gasHeatingValue = 0;
      this.flowCalculations.specificGravity = 0.9669;
    } else if (this.flowCalculations.gasType == 3 && this.settings.unitsOfMeasure == 'Imperial') {
      this.flowCalculations.gasHeatingValue = 325;
      this.flowCalculations.specificGravity = 0.0696;
    } else if (this.flowCalculations.gasType == 3 && this.settings.unitsOfMeasure == 'Metric') {
      this.flowCalculations.gasHeatingValue = this.convertUnitsService.roundVal(this.convertUnitsService.value(325).from('btuSCF').to('kJNm3'), 2);
      this.flowCalculations.specificGravity = 0.0696;
    } else if (this.flowCalculations.gasType == 4) {
      this.flowCalculations.gasHeatingValue = 0;
      this.flowCalculations.specificGravity = 1.5189;
    } else if (this.flowCalculations.gasType == 5) {
      this.flowCalculations.gasHeatingValue = 0;
      this.flowCalculations.specificGravity = 1;
    } else if (this.flowCalculations.gasType == 6) {
      this.flowCalculations.gasHeatingValue = 0;
      this.flowCalculations.specificGravity = 0;
    }
    this.calculate();
  }
}
