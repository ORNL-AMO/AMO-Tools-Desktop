import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { Settings } from '../../../../shared/models/settings';
import { FlowCalculations, FlowCalculationsOutput } from '../../../../shared/models/phast/flowCalculations';
import { ConvertUnitsService } from "../../../../shared/convert-units/convert-units.service";
import { FormGroup } from '@angular/forms';
import { EnergyUseService } from '../energy-use.service';

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
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;

  // keeps a value between a certain range
  readonly rangeCheck: RangeProperties = {
    'orificeInsideRatio': {
      min: null, max: 0.7
    },
    'dischargeCoefficient': {
      min: 0.0, max: 1.0
    }
  };

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

  insidePipeDiameterError: string = null;
  dischargeCoefficientError: string = null;

  form: FormGroup;

  constructor(private suiteDbService: SuiteDbService, private convertUnitsService: ConvertUnitsService, private energyUseService: EnergyUseService) {
  }

  ngOnInit() {
    //this.gasTypeOptions = this.suiteDbService.selectGasFlueGasMaterials();
    this.form = this.energyUseService.getFormFromObj(this.flowCalculations);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.flowCalculations) {
      this.form = this.energyUseService.getFormFromObj(this.flowCalculations);
    }
  }

  calculate() {
    //TODO: update validation with extra error check rules
    this.flowCalculations = this.energyUseService.getObjFromForm(this.form);
    const insidePipeDiameter = this.flowCalculations.insidePipeDiameter;
    const orificeDiameter = this.flowCalculations.orificeDiameter;
    let properties = this.rangeCheck.orificeInsideRatio;
    if (orificeDiameter / insidePipeDiameter > properties.max) {
      this.insidePipeDiameterError = 'Orifice diameter cannot be more than ' + properties.max * 100 + '% of pipe diameter';
    } else {
      this.insidePipeDiameterError = null;
    }

    const dischargeCoefficient = this.flowCalculations.dischargeCoefficient;
    properties = this.rangeCheck.dischargeCoefficient;
    if (dischargeCoefficient > properties.max || dischargeCoefficient < properties.min) {
      this.dischargeCoefficientError = 'Discharge coefficient must be between ' + properties.max + ' and ' + properties.min;
    } else {
      this.dischargeCoefficientError = null;
    }
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
    this.flowCalculations = this.energyUseService.getObjFromForm(this.form);
    if (this.flowCalculations.gasType == 0) {
      this.flowCalculations.gasHeatingValue = 1032.44;
      this.flowCalculations.specificGravity = 0.657;
    } else if (this.flowCalculations.gasType == 1) {
      this.flowCalculations.gasHeatingValue = 0;
      this.flowCalculations.specificGravity = 1.1044;
    } else if (this.flowCalculations.gasType == 2) {
      this.flowCalculations.gasHeatingValue = 0;
      this.flowCalculations.specificGravity = 0.9669;
    } else if (this.flowCalculations.gasType == 3) {
      this.flowCalculations.gasHeatingValue = 325;
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

    if (this.settings.unitsOfMeasure == 'Metric') {
      this.flowCalculations.gasHeatingValue = this.convertUnitsService.roundVal(this.convertUnitsService.value(this.flowCalculations.gasHeatingValue).from('btuSCF').to('kJNm3'), 2);
    }
    this.form = this.energyUseService.getFormFromObj(this.flowCalculations);
    this.calculate();
  }


}

interface Properties {
  readonly min: number;
  readonly max: number;
}

interface RangeProperties {
  readonly orificeInsideRatio: Properties;
  readonly dischargeCoefficient: Properties;
}
