import { Component, OnInit, Input } from '@angular/core';
import { FSAT, FsatOutput, Modification, FsatValid } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
@Component({
  selector: 'app-fsat-report-graphs',
  templateUrl: './fsat-report-graphs.component.html',
  styleUrls: ['./fsat-report-graphs.component.css']
})
export class FsatReportGraphsComponent implements OnInit {
  @Input()
  fsat: FSAT;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;
  @Input()
  printSankey: boolean;
  @Input()
  printGraphs: boolean;

  allChartData: Array<{
    name: string,
    valuesAndLabels: Array<{value: number, label: string}>,
    barChartLabels: Array<string>,
    barChartValues: Array<number>,
    modification?: Modification,
    valid: FsatValid
  }>;

  selectedBaselineData: {
    name: string,
    valuesAndLabels: Array<{value: number, label: string}>,
    barChartLabels: Array<string>,
    barChartValues: Array<number>,
    valid: FsatValid
  };
  selectedModificationData: {
    name: string,
    valuesAndLabels: Array<{value: number, label: string}>,
    barChartLabels: Array<string>,
    barChartValues: Array<number>,
    valid: FsatValid
  };
  barChartYAxisLabel: string;
  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.setAllChartData();
    this.barChartYAxisLabel = 'Power (kW)';
  }

  setAllChartData() {
    this.allChartData = new Array();
    this.addChartData(this.fsat.outputs, this.fsat.name, this.fsat.valid);
    this.selectedBaselineData = this.allChartData[0];
    if (this.fsat.modifications && this.fsat.modifications.length != 0) {
      this.fsat.modifications.forEach(modification => {
        this.addChartData(modification.fsat.outputs, modification.fsat.name, modification.fsat.valid, modification);
      });
      this.selectedModificationData = this.allChartData[1];
    }
  }

  addChartData(results: FsatOutput, name: string, isValid: FsatValid, modification?: Modification) {
    let baselineChartData: FsatGraphData = this.getGraphData(results);
    let barChartLabels: Array<string> = ['Energy Input', 'Motor Losses', 'Drive Losses', 'Fan Losses', 'Useful Output'];
    let barChartValues: Array<number> = [baselineChartData.energyInput, baselineChartData.motorLoss, baselineChartData.driveLoss, baselineChartData.fanLoss, baselineChartData.usefulOutput];
    this.allChartData.push({
      name: name,
      valuesAndLabels : [
        {
          value: baselineChartData.motorLoss,
          label: 'Motor Losses'
        },
        {
          value: baselineChartData.driveLoss,
          label: 'Drive Losses'
        },
        {
          value: baselineChartData.fanLoss,
          label: 'Fan Losses'
        },
        {
          value: baselineChartData.usefulOutput,
          label:  'Useful Output'
        },
      ],
      barChartLabels: barChartLabels,
      barChartValues: barChartValues,
      modification: modification,
      valid: isValid
    })
  }

  getValueArray(data: FsatGraphData): Array<number> {
    return [data.motorLoss, data.driveLoss, data.fanLoss, data.usefulOutput];
  }


  getGraphData(results: FsatOutput): FsatGraphData {
    let motorShaftPower: number = results.motorShaftPower;
    let fanShaftPower: number = results.fanShaftPower;
    if (this.settings.powerMeasurement === 'hp') {
      motorShaftPower = this.convertUnitsService.value(results.motorShaftPower).from('hp').to('kW');
      fanShaftPower = this.convertUnitsService.value(results.fanShaftPower).from("hp").to('kW');
    }
    let energyInput = results.motorPower;
    let motorLoss = results.motorPower * (1 - (results.motorEfficiency / 100));
    let driveLoss = motorShaftPower - fanShaftPower;
    let fanLoss = (results.motorPower - motorLoss - driveLoss) * (1 - (results.fanEfficiency / 100));
    let usefulOutput = results.motorPower - (motorLoss + driveLoss + fanLoss);
    return { energyInput: energyInput, motorLoss: motorLoss, fanLoss: fanLoss, driveLoss: driveLoss, usefulOutput: usefulOutput };
  }
}


export interface FsatGraphData {
  energyInput: number,
  motorLoss: number,
  fanLoss: number,
  driveLoss: number,
  usefulOutput: number
}
