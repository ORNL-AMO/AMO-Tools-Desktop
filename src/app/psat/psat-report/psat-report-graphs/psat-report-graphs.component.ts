import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { PSAT, PsatOutputs, Modification } from '../../../shared/models/psat';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Component({
    selector: 'app-psat-report-graphs',
    templateUrl: './psat-report-graphs.component.html',
    styleUrls: ['./psat-report-graphs.component.css'],
    standalone: false
})
export class PsatReportGraphsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  psat: PSAT;
  @Input()
  printView: boolean;
  @Input()
  printSankey: boolean;
  @Input()
  printGraphs: boolean;

  allChartData: Array<{
    name: string,
    valuesAndLabels: Array<{ value: number, label: string }>,
    barChartLabels: Array<string>,
    barChartValues: Array<number>,
    modification?: Modification,
    isValid: boolean
  }>;

  selectedBaselineData: {
    name: string,
    valuesAndLabels: Array<{ value: number, label: string }>,
    barChartLabels: Array<string>,
    barChartValues: Array<number>
  };
  selectedModificationData: {
    name: string,
    valuesAndLabels: Array<{ value: number, label: string }>,
    barChartLabels: Array<string>,
    barChartValues: Array<number>
  };
  barChartYAxisLabel: string;
  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.setAllChartData();
    this.barChartYAxisLabel = 'Power (kW)';
  }

  setAllChartData() {
    this.allChartData = new Array();
    this.addChartData(JSON.parse(JSON.stringify(this.psat.outputs)), this.psat.name);
    this.selectedBaselineData = this.allChartData[0];
    if (this.psat.modifications && this.psat.modifications.length != 0) {
      this.psat.modifications.forEach(modification => {
        this.addChartData(JSON.parse(JSON.stringify(modification.psat.outputs)), modification.psat.name, modification);
      });
      if (this.allChartData.length > 1) {
        this.selectedModificationData = this.allChartData[1];
      }
    }
  }

  addChartData(results: PsatOutputs, name: string, modification?: Modification) {
    let baselineChartData: PsatGraphData = this.getGraphData(results);
    let barChartLabels: Array<string> = ['Energy Input', 'Motor Losses', 'Drive Losses', 'Pump Losses', 'Useful Output'];
    let barChartValues: Array<number> = [baselineChartData.energyInput, baselineChartData.motorLoss, baselineChartData.driveLoss, baselineChartData.pumpLoss, baselineChartData.usefulOutput];
    let isValid: boolean = true;
    if (modification) {
      isValid = modification.psat.valid.isValid;
    }

    this.allChartData.push({
      name: name,
      valuesAndLabels: [
        {
          value: baselineChartData.motorLoss,
          label: 'Motor Losses'
        },
        {
          value: baselineChartData.driveLoss,
          label: 'Drive Losses'
        },
        {
          value: baselineChartData.pumpLoss,
          label: 'Pump Losses'
        },
        {
          value: baselineChartData.usefulOutput,
          label: 'Useful Output'
        },
      ],
      barChartLabels: barChartLabels,
      barChartValues: barChartValues,
      modification: modification,
      isValid: isValid
    })
  }

  getValueArray(data: PsatGraphData): Array<number> {
    return [data.motorLoss, data.driveLoss, data.pumpLoss, data.usefulOutput];
  }


  getGraphData(results: PsatOutputs): PsatGraphData {
    let motorShaftPower: number = results.motor_shaft_power;
    let moverShaftPower: number = results.mover_shaft_power;
    if (this.settings.powerMeasurement === 'hp') {
      motorShaftPower = this.convertUnitsService.value(results.motor_shaft_power).from('hp').to('kW');
      moverShaftPower = this.convertUnitsService.value(results.mover_shaft_power).from("hp").to('kW');
    }
    let energyInput = results.motor_power;
    let motorLoss = results.motor_power * (1 - (results.motor_efficiency / 100));
    let driveLoss = motorShaftPower - moverShaftPower;
    let pumpLoss = (results.motor_power - motorLoss - driveLoss) * (1 - (results.pump_efficiency / 100));
    let usefulOutput = results.motor_power - (motorLoss + driveLoss + pumpLoss);
    return { energyInput: energyInput, motorLoss: motorLoss, pumpLoss: pumpLoss, driveLoss: driveLoss, usefulOutput: usefulOutput };
  }
}


export interface PsatGraphData {
  energyInput: number,
  motorLoss: number,
  pumpLoss: number,
  driveLoss: number,
  usefulOutput: number
}