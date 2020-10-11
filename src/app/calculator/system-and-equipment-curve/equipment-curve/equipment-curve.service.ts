import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { ByDataInputs, ByEquationInputs, EquipmentInputs } from '../../../shared/models/system-and-equipment-curve';

@Injectable()
export class EquipmentCurveService {


  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { }

  //equipment curve
  getEquipmentCurveFormFromObj(obj: EquipmentInputs): FormGroup {
    let form: FormGroup = this.formBuilder.group({
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

  getEquipmentCurveObjFromForm(form: FormGroup): EquipmentInputs {
    return {
      measurementOption: form.controls.measurementOption.value,
      baselineMeasurement: form.controls.baselineMeasurement.value,
      modificationMeasurementOption: form.controls.measurementOption.value
    }
  }

  //by equation
  getByEquationFormFromObj(obj: ByEquationInputs): FormGroup {
    let form: FormGroup = this.formBuilder.group({
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
  getPumpByEquationDefault(flowUnit: string, yValueUnit: string, yImperial: string): ByEquationInputs {
    let tmpMaxFlow = 1020;
    let tmpConstant = 356.96;
    let powerConstant = 47.68;

    if (flowUnit !== 'gpm') {
      tmpMaxFlow = Math.round(this.convertUnitsService.value(tmpMaxFlow).from('gpm').to(flowUnit) * 100) / 100;
    }
    if (yValueUnit !== yImperial) {
      tmpConstant = Math.round(this.convertUnitsService.value(tmpConstant).from(yImperial).to(yValueUnit) * 100) / 100;
    }

    return {
      maxFlow: tmpMaxFlow,
      equationOrder: 3,
      constant: tmpConstant,
      flow: -0.0686,
      flowTwo: 0.000005,
      flowThree: -0.00000008,
      flowFour: 0,
      flowFive: 0,
      flowSix: 0,
      powerConstant: powerConstant,
      powerOrder: 3,
      powerFlow: -0.00702,
      powerFlowTwo: 0.0000104,
      powerFlowThree: -0.00000000282,
      powerFlowFour: 0,
      powerFlowFive: 0,
      powerFlowSix: 0,
    }
  }

  getFanByEquationDefault(flowUnit: string, yValueUnit: string, yImperial: string): ByEquationInputs {
    return {
      maxFlow: 0,
      equationOrder: 1,
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

  getByEquationObjFromForm(form: FormGroup): ByEquationInputs {
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

  getByDataFormFromObj(inputObj: ByDataInputs): FormGroup {
    let tmpFormArray: FormArray = new FormArray([]);
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

    let tmpForm: FormGroup = this.formBuilder.group({
      dataRows: [tmpFormArray],
      dataOrder: [inputObj.dataOrder, Validators.required],
      powerDataOrder: [inputObj.powerDataOrder, Validators.required],
    });
    return tmpForm;
  }

  getByDataObjFromForm(form: FormGroup): ByDataInputs {
    let tmpFormArray: FormArray = form.controls.dataRows.value;
    let dataRows: Array<{ flow: number, yValue: number, power: number }> = tmpFormArray.value;
    return {
      dataRows: dataRows,
      dataOrder: form.controls.dataOrder.value,
      powerDataOrder: form.controls.powerDataOrder.value
    }
  }
}

