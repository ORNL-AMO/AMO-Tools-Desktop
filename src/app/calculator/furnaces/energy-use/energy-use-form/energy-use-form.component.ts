import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { FlowCalculations, FlowCalculationsOutput } from '../../../../shared/models/phast/flowCalculations';
import { PhastService } from '../../../../phast/phast.service';
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

  gasTypeOptions: any;

  tmpGasTypeOptions: any = [
    {
      name: 'Air',
      value: 0
    }, {
      name: 'Ammonia Dissociated',
      value: 1
    }, {
      name: 'Argon',
      value: 2
    }, {
      name: 'Butane',
      value: 3
    }, {
      name: 'Endothermic Ammonia',
      value: 4
    }, {
      name: 'Exothermic Cracked (Lean)',
      value: 5
    }, {
      name: 'Exothermic Cracked (Rich)',
      value: 6
    }, {
      name: 'Helium',
      value: 7
    }, {
      name: 'Hydrogen',
      value: 8
    }, {
      name: 'Natural Gas',
      value: 9
    }, {
      name: 'Nitrogen',
      value: 10
    }, {
      name: 'Other',
      value: 11
    }, {
      name: 'Oxygen',
      value: 12
    }, {
      name: 'Propane',
      value: 13
    }
  ]

  constructor(private suiteDbService: SuiteDbService, private phastService: PhastService) { }

  ngOnInit() {
    this.gasTypeOptions = this.suiteDbService.selectGasFlueGasMaterials();
    this.calculate();
  }

  calculate() {
    this.flowCalculationResults = this.phastService.flowCalculations(this.flowCalculations);
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
}
