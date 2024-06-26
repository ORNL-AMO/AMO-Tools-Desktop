import { Injectable } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormArray } from '@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { ByDataInputs, ByEquationInputs, EquipmentInputs } from '../../../shared/models/system-and-equipment-curve';

@Injectable()
export class EquipmentCurveService {


  constructor(private formBuilder: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService) { }

  //equipment curve
  getEquipmentCurveFormFromObj(obj: EquipmentInputs): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      measurementOption: [obj.measurementOption, Validators.required],
      baselineMeasurement: [obj.baselineMeasurement, [Validators.required, Validators.min(0)]],
      modificationMeasurementOption: [obj.modificationMeasurementOption, Validators.required],
    });
    return form;
  }

  getEquipmentCurveDefault(): EquipmentInputs {
    let exampleEquipment: EquipmentInputs = {
      measurementOption: 0,
      baselineMeasurement: 1800,
      modificationMeasurementOption: 0,
    };
    return exampleEquipment;
  }

  getEquipmentCurveExample(): EquipmentInputs {
    let exampleEquipment: EquipmentInputs = {
      measurementOption: 1,
      baselineMeasurement: 1800,
      modificationMeasurementOption: 0,
    };
    return exampleEquipment;
  }

  getResetEquipmentInputs(equipment: string): EquipmentInputs {
    let option = equipment == 'fan' ? 1 : 0;
    let exampleEquipment: EquipmentInputs = {
      measurementOption: option,
      baselineMeasurement: 0,
      modificationMeasurementOption: 0,
    };
    return exampleEquipment;
  }

  getEquipmentCurveObjFromForm(form: UntypedFormGroup): EquipmentInputs {
    return {
      measurementOption: form.controls.measurementOption.value,
      baselineMeasurement: form.controls.baselineMeasurement.value,
      modificationMeasurementOption: form.controls.measurementOption.value
    }
  }

  //by equation
  getByEquationFormFromObj(obj: ByEquationInputs): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      maxFlow: [obj.maxFlow, [Validators.required, Validators.min(0), Validators.max(1000000)]],
      equationOrder: [obj.equationOrder, Validators.required],
      constant: [obj.constant, [Validators.required, Validators.min(0)]],
      flow: [obj.flow, Validators.required],
      flowTwo: [obj.flowTwo, Validators.required],
      flowThree: [obj.flowThree, Validators.required],
      flowFour: [obj.flowFour, Validators.required],
      flowFive: [obj.flowFive, Validators.required],
      flowSix: [obj.flowSix, Validators.required],
      powerConstant: [obj.powerConstant, [Validators.required, Validators.min(0)]],
      powerOrder: [obj.powerOrder, Validators.required],
      powerFlow: [obj.powerFlow, Validators.required],
      powerFlowTwo: [obj.powerFlowTwo, Validators.required],
      powerFlowThree: [obj.powerFlowThree, Validators.required],
      powerFlowFour: [obj.powerFlowFour, Validators.required],
      powerFlowFive: [obj.powerFlowFive, Validators.required],
      powerFlowSix: [obj.powerFlowSix, Validators.required],
    });
    return form;
  }

  //example/default same
  getPumpByEquationDefault(settings: Settings): ByEquationInputs {
    let maxFlow = 1020;
    let constant = 357.02595478256984;
    let flow = - 0.06993099587341044;
    let flowTwo = 0.000010825931568798886;
    let flowThree = -8.482672009106605e-8;

    let powerConstant = 46.8;
    let powerFlow = .00104;

    if (settings.unitsOfMeasure !== 'Imperial') {
      maxFlow = 231.67;
      constant = 108.81815885580232;
      flow = -0.09403496052228517;
      flowTwo = 0.00006603589701907377;
      flowThree = -0.0000022121905496834693;

      powerConstant = 34.867598732612265;
      powerFlow = 0.003407767151145659;
    }

    return {
      maxFlow: maxFlow,
      equationOrder: 3,
      constant: constant,
      flow: flow,
      flowTwo: flowTwo,
      flowThree: flowThree,
      flowFour: 0,
      flowFive: 0,
      flowSix: 0,
      powerConstant: powerConstant,
      powerOrder: 1,
      powerFlow: powerFlow,
      powerFlowTwo: 0,
      powerFlowThree: 0,
      powerFlowFour: 0,
      powerFlowFive: 0,
      powerFlowSix: 0,
    }
  }

  // * is example
  getFanByEquationDefault(settings: Settings): ByEquationInputs {
    // acfm /ft3/min
    let maxFlow = 187300;
    // inH2o 
    let constant = 22.103;
    let flow = 0.000025404415393103896;
    let flowTwo = -6.47500274437936e-10;

    let powerConstant = 21.968;
    let powerFlow = .00433;

    if (settings.unitsOfMeasure !== 'Imperial') {
      maxFlow = Math.round(this.convertUnitsService.value(maxFlow).from('ft3/min').to(settings.fanFlowRate) * 100) / 100;
      constant = Math.round(this.convertUnitsService.value(constant).from('inH2o').to(settings.fanPressureMeasurement) * 100) / 100;
      flow = 13.388477637275829;
      flowTwo = -0.7233065798221425;
      powerConstant = 16.38006579523656;
      powerFlow = 6.854168950854409;
    }
    
    return {
      maxFlow: maxFlow,
      equationOrder: 2,
      // constant: 22.10324798599227,
      constant: constant,
      // flow: 0.000025404415393103896,
      flow: flow,
      flowTwo: flowTwo,
      // flowTwo: -6.0e-10,
      flowThree: 0,
      flowFour: 0,
      flowFive: 0,
      flowSix: 0,
      // powerConstant: 21.968136727246897,
      powerConstant: powerConstant,
      powerOrder: 1,
      // powerFlow: .004337961997619517,
      powerFlow: powerFlow,
      powerFlowTwo: 0,
      powerFlowThree: 0,
      powerFlowFour: 0,
      powerFlowFive: 0,
      powerFlowSix: 0,
    }

  }

  getResetByEquationInputs(): ByEquationInputs {
    return {
      maxFlow: 0,
      equationOrder: 3,
      constant: 0,
      flow: 0,
      flowTwo: 0,
      flowThree: 0,
      flowFour: 0,
      flowFive: 0,
      flowSix: 0,
      powerConstant: 0,
      powerOrder: 1,
      powerFlow: 0,
      powerFlowTwo: 0,
      powerFlowThree: 0,
      powerFlowFour: 0,
      powerFlowFive: 0,
      powerFlowSix: 0,
    }
  }

  getByEquationObjFromForm(form: UntypedFormGroup): ByEquationInputs {
    return {
      maxFlow: form.controls.maxFlow.value,
      equationOrder: form.controls.equationOrder.value,
      constant: form.controls.constant.value,
      flow: form.controls.flow.value,
      flowTwo: form.controls.flowTwo.value,
      flowThree: form.controls.flowThree.value,
      flowFour: form.controls.flowFour.value,
      flowFive: form.controls.flowFive.value,
      flowSix: form.controls.flowSix.value,
      powerConstant: form.controls.powerConstant.value,
      powerOrder: form.controls.powerOrder.value,
      powerFlow: form.controls.powerFlow.value,
      powerFlowTwo: form.controls.powerFlowTwo.value,
      powerFlowThree: form.controls.powerFlowThree.value,
      powerFlowFour: form.controls.powerFlowFour.value,
      powerFlowFive: form.controls.powerFlowFive.value,
      powerFlowSix: form.controls.powerFlowSix.value,
    }
  }

  //by data
  getByDataPumpDefault(settings: Settings): ByDataInputs {
    let tmpMaxFlow = 1020;
    let tmpFlow1 = 100;
    let tmpFlow2 = 630;
    let tmpFlow3 = 1020;
    let yValue0 = 355;
    let yValue1 = 351;
    let yValue2 = 294;
    let yValue3 = 202;
    let yValueConstant = 356.96;
    let power0 = 0;
    let power1 = 0;
    let power2 = 0;
    let power3 = 0;
    if (settings.flowMeasurement !== 'gpm') {
      tmpMaxFlow = Math.round(this.convertUnitsService.value(tmpMaxFlow).from('gpm').to(settings.flowMeasurement) * 100) / 100;
      tmpFlow1 = Math.round(this.convertUnitsService.value(tmpFlow1).from('gpm').to(settings.flowMeasurement) * 100) / 100;
      tmpFlow2 = Math.round(this.convertUnitsService.value(tmpFlow2).from('gpm').to(settings.flowMeasurement) * 100) / 100;
      tmpFlow3 = Math.round(this.convertUnitsService.value(tmpFlow3).from('gpm').to(settings.flowMeasurement) * 100) / 100;
    }
    if (settings.distanceMeasurement !== 'ft') {
      yValueConstant = Math.round(this.convertUnitsService.value(yValueConstant).from('ft').to(settings.distanceMeasurement) * 100) / 100;
      yValue0 = Math.round(this.convertUnitsService.value(yValue0).from('ft').to(settings.distanceMeasurement) * 100) / 100;
      yValue1 = Math.round(this.convertUnitsService.value(yValue1).from('ft').to(settings.distanceMeasurement) * 100) / 100;
      yValue2 = Math.round(this.convertUnitsService.value(yValue2).from('ft').to(settings.distanceMeasurement) * 100) / 100;
      yValue3 = Math.round(this.convertUnitsService.value(yValue3).from('ft').to(settings.distanceMeasurement) * 100) / 100;
    }
    if (settings.fanPowerMeasurement !== 'hp') {
      power0 = Math.round(this.convertUnitsService.value(power0).from('hp').to(settings.fanPowerMeasurement) * 100) / 100;
      power1 = Math.round(this.convertUnitsService.value(power1).from('hp').to(settings.fanPowerMeasurement) * 100) / 100;
      power2 = Math.round(this.convertUnitsService.value(power2).from('hp').to(settings.fanPowerMeasurement) * 100) / 100;
      power3 = Math.round(this.convertUnitsService.value(power3).from('hp').to(settings.fanPowerMeasurement) * 100) / 100;
    }
    return {
      dataRows: [
        { flow: 0, yValue: yValue0, power: power0 },
        { flow: tmpFlow1, yValue: yValue1, power: power1 },
        { flow: tmpFlow2, yValue: yValue2, power: power2 },
        { flow: tmpFlow3, yValue: yValue3, power: power3 }
      ],
      dataOrder: 3,
      powerDataOrder: 1
    }
  }


  getFanByDataExample(settings: Settings): ByDataInputs {
    let dataRows: Array<{ flow: number, yValue: number, power: number }> = [
      { flow: 0, yValue: 22.3, power: 0 },
      { flow: 43200, yValue: 21.8, power: 241 },
      { flow: 72050, yValue: 20.3, power: 349 },
      { flow: 100870, yValue: 18, power: 462 },
      { flow: 129700, yValue: 14.8, power: 566 },
      { flow: 158500, yValue: 10.2, power: 667 },
      { flow: 172900, yValue: 7.3, power: 770 },
      { flow: 187300, yValue: 3.7, power: 871 }
    ];

    dataRows.forEach(row => {
      if (settings.fanFlowRate != 'ft3/min') {
        row.flow = Math.round(this.convertUnitsService.value(row.flow).from('ft3/min').to(settings.fanFlowRate) * 100) / 100;
      }
      if (settings.fanPressureMeasurement != 'inH2o') {
        row.yValue = Math.round(this.convertUnitsService.value(row.yValue).from('inH2o').to(settings.fanPressureMeasurement) * 100) / 100;
      }
      if (settings.powerMeasurement != 'hp') {
        row.power = Math.round(this.convertUnitsService.value(row.power).from('hp').to(settings.fanPowerMeasurement) * 100) / 100;
      }
    });

    let exampleByDataInputs: ByDataInputs = {
      dataRows: dataRows,
      dataOrder: 2,
      powerDataOrder: 1
    };
    return exampleByDataInputs;
  }

  getPumpByDataExample(settings: Settings): ByDataInputs {
    let dataRows: Array<{ flow: number, yValue: number, power: number }> = [
      { flow: 0, yValue: 357, power: 47.7 },
      { flow: 250, yValue: 339, power: 46.5 },
      { flow: 500, yValue: 314, power: 46.4 },
      { flow: 750, yValue: 275, power: 47.1 },
      { flow: 1000, yValue: 213, power: 48.2 },
      { flow: 1020, yValue: 207, power: 48.3 },
    ];

    dataRows.forEach(row => {
      if (settings.flowMeasurement !== 'gpm') {
        row.flow = Math.round(this.convertUnitsService.value(row.flow).from('gpm').to(settings.flowMeasurement) * 100) / 100;
      }
      if (settings.distanceMeasurement !== 'ft') {
        row.yValue = Math.round(this.convertUnitsService.value(row.yValue).from('ft').to(settings.distanceMeasurement) * 100) / 100;
      }
      if (settings.powerMeasurement !== 'hp') {
        row.power = Math.round(this.convertUnitsService.value(row.power).from('hp').to(settings.powerMeasurement) * 100) / 100;
      }
    });

    let exampleByDataInputs: ByDataInputs = {
      dataRows: dataRows,
      dataOrder: 3,
      powerDataOrder: 1
    };
    return exampleByDataInputs;
  }

  getResetByDataInputs(): ByDataInputs {
    return {
      dataRows: [
        { flow: 0, yValue: 0, power: 0 },
        { flow: 0, yValue: 0, power: 0 },
        { flow: 0, yValue: 0, power: 0 },
        { flow: 0, yValue: 0, power: 0 }
      ],
      dataOrder: 3,
      powerDataOrder: 1,
    }
  }

  getByDataFormFromObj(inputObj: ByDataInputs): UntypedFormGroup {
    let tmpFormArray: UntypedFormArray = new UntypedFormArray([]);
    if (inputObj.dataRows !== undefined && inputObj.dataRows !== null) {
      //iterate through dataRows and create controls for them
      inputObj.dataRows.forEach(dataRow => {
        let tmpDataRowForm = this.formBuilder.group({
          flow: [dataRow.flow, [Validators.required, Validators.max(1000000)]],
          yValue: [dataRow.yValue, [Validators.required, Validators.min(0)]],
          power: [dataRow.power, [Validators.required, Validators.min(0)]]
        });
        tmpFormArray.push(tmpDataRowForm);
      });
    }

    let tmpForm: UntypedFormGroup = this.formBuilder.group({
      dataRows: [tmpFormArray],
      dataOrder: [inputObj.dataOrder, Validators.required],
      powerDataOrder: [inputObj.powerDataOrder, Validators.required],
    });
    return tmpForm;
  }

  getByDataObjFromForm(form: UntypedFormGroup): ByDataInputs {
    let tmpFormArray: UntypedFormArray = form.controls.dataRows.value;
    let dataRows: Array<{ flow: number, yValue: number, power: number }> = tmpFormArray.value;
    return {
      dataRows: dataRows,
      dataOrder: form.controls.dataOrder.value,
      powerDataOrder: form.controls.powerDataOrder.value
    }
  }
}

