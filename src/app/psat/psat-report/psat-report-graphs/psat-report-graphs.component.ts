import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { PSAT, PsatOutputs, Modification } from '../../../shared/models/psat';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-psat-report-graphs',
  templateUrl: './psat-report-graphs.component.html',
  styleUrls: ['./psat-report-graphs.component.css']
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
    pieChartLabels: Array<string>,
    pieChartValues: Array<number>,
    barChartLabels: Array<string>,
    barChartValues: Array<number>,
    modification?: Modification
  }>;

  selectedBaselineData: {
    name: string, pieChartLabels: Array<string>, pieChartValues: Array<number>,
    barChartLabels: Array<string>,
    barChartValues: Array<number>
  };
  selectedModificationData: {
    name: string, pieChartLabels: Array<string>, pieChartValues: Array<number>,
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
      this.selectedModificationData = this.allChartData[1];
    }
  }

  addChartData(results: PsatOutputs, name: string, modification?: Modification) {
    let baselineChartData: PsatGraphData = this.getGraphData(results);
    let pieChartLabels: Array<string> = ['Motor Losses', 'Drive Losses', 'Pump Losses', 'Useful Output'];
    let pieChartValues: Array<number> = [baselineChartData.motorLoss, baselineChartData.driveLoss, baselineChartData.pumpLoss, baselineChartData.usefulOutput];
    let barChartLabels: Array<string> = ['Energy Input', 'Motor Losses', 'Drive Losses', 'Pump Losses', 'Useful Output'];
    let barChartValues: Array<number> = [baselineChartData.energyInput, baselineChartData.motorLoss, baselineChartData.driveLoss, baselineChartData.pumpLoss, baselineChartData.usefulOutput];
    this.allChartData.push({
      name: name,
      pieChartLabels: pieChartLabels,
      pieChartValues: pieChartValues,
      barChartLabels: barChartLabels,
      barChartValues: barChartValues,
      modification: modification
    })
  }

  getValueArray(data: PsatGraphData): Array<number> {
    return [data.motorLoss, data.driveLoss, data.pumpLoss, data.usefulOutput];
  }


  getGraphData(results: PsatOutputs): PsatGraphData {
    let motorShaftPower: number = results.motor_shaft_power;
    let pumpShaftPower: number = results.pump_shaft_power;
    if (this.settings.powerMeasurement === 'hp') {
      motorShaftPower = this.convertUnitsService.value(results.motor_shaft_power).from('hp').to('kW');
      pumpShaftPower = this.convertUnitsService.value(results.pump_shaft_power).from("hp").to('kW');
    }
    let energyInput = results.motor_power;
    let motorLoss = results.motor_power * (1 - (results.motor_efficiency / 100));
    let driveLoss = motorShaftPower - pumpShaftPower;
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