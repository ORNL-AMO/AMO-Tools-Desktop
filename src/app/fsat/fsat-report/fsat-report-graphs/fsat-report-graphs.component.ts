import { Component, OnInit, Input } from '@angular/core';
import { FSAT, FsatOutput, Modification } from '../../../shared/models/fans';
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
    this.addChartData(JSON.parse(JSON.stringify(this.fsat.outputs)), this.fsat.name);
    this.selectedBaselineData = this.allChartData[0];
    if (this.fsat.modifications && this.fsat.modifications.length != 0) {
      this.fsat.modifications.forEach(modification => {
        this.addChartData(JSON.parse(JSON.stringify(modification.fsat.outputs)), modification.fsat.name, modification);
      });
      this.selectedModificationData = this.allChartData[1];
    }
  }

  addChartData(results: FsatOutput, name: string, modification?: Modification) {
    let baselineChartData: FsatGraphData = this.getGraphData(results);
    let pieChartLabels: Array<string> = ['Motor Losses', 'Drive Losses', 'Fan Losses', 'Useful Output'];
    let pieChartValues: Array<number> = [baselineChartData.motorLoss, baselineChartData.driveLoss, baselineChartData.fanLoss, baselineChartData.usefulOutput];
    let barChartLabels: Array<string> = ['Energy Input', 'Motor Losses', 'Drive Losses', 'Fan Losses', 'Useful Output'];
    let barChartValues: Array<number> = [baselineChartData.energyInput, baselineChartData.motorLoss, baselineChartData.driveLoss, baselineChartData.fanLoss, baselineChartData.usefulOutput];
    this.allChartData.push({
      name: name,
      pieChartLabels: pieChartLabels,
      pieChartValues: pieChartValues,
      barChartLabels: barChartLabels,
      barChartValues: barChartValues,
      modification: modification
    })
  }

  getValueArray(data: FsatGraphData): Array<number> {
    return [data.motorLoss, data.driveLoss, data.fanLoss, data.usefulOutput];
  }


  getGraphData(results: FsatOutput): FsatGraphData {
    // if (this.settings.fanPowerMeasurement === 'hp') {

    //         motorShaftPower = this.convertUnitsService.value(tmpOutput.motorShaftPower).from('hp').to('kW');
    //         fanShaftPower = this.convertUnitsService.value(tmpOutput.fanShaftPower).from('hp').to('kW');
    
    //         energyInput = tmpOutput.motorPower;
    //         motorLoss = energyInput - this.convertUnitsService.value(tmpOutput.motorShaftPower).from('hp').to('kW');
    //         driveLoss = this.convertUnitsService.value(tmpOutput.motorShaftPower - tmpOutput.fanShaftPower).from('hp').to('kW');
    //         fanLoss = this.convertUnitsService.value(tmpOutput.fanShaftPower).from('hp').to('kW') * (1 - (tmpOutput.fanEfficiency / 100));
    //         usefulOutput = this.convertUnitsService.value(tmpOutput.fanShaftPower).from('hp').to('kW') * (tmpOutput.fanEfficiency / 100);
            
    //       }
    //       else {
    //         motorShaftPower = tmpOutput.motorShaftPower;
    //         fanShaftPower = tmpOutput.fanShaftPower;
    
    //         energyInput = tmpOutput.motorPower;
    //         motorLoss = tmpOutput.motorPower - tmpOutput.motorShaftPower;
    //         driveLoss = tmpOutput.motorShaftPower - tmpOutput.fanShaftPower;
    //         fanLoss = tmpOutput.fanShaftPower * (1 - (tmpOutput.fanEfficiency / 100));
    //         usefulOutput = tmpOutput.fanShaftPower * (tmpOutput.fanEfficiency / 100);
    //       }
    
    //       tmpPieLabels.push('Motor Loss: ' + (100 * motorLoss / energyInput).toFixed(2).toString() + "%");
    //       tmpPieValues.push(motorLoss);
    //       tmpPieLabels.push('Drive Loss: ' + (100 * driveLoss / energyInput).toFixed(2).toString() + "%");
    //       tmpPieValues.push(driveLoss);
    //       tmpPieLabels.push('Fan Loss: ' + (100 * fanLoss / energyInput).toFixed(2).toString() + "%");
    //       tmpPieValues.push(fanLoss);
    //       tmpPieLabels.push('Useful Output: ' + (100 * usefulOutput / energyInput).toFixed(2).toString() + "%");
    //       tmpPieValues.push(usefulOutput);
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
