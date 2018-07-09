import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { FSAT, FsatOutput, FsatInput } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import { WindowRefService } from '../../../indexedDb/window-ref.service';
import { FsatService } from '../../fsat.service';
import { FormGroup } from '@angular/forms';

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
  assessment: Assessment;
  @Input()
  printView: boolean;
  @Input()
  printSankey: boolean;
  @Input()
  printGraphs: boolean;

  @ViewChild('pieChartContainer') pieChartContainer: ElementRef;
  @ViewChild('barChartContainer') barChartContainer: ElementRef;

  selectedResults: FsatOutput;
  selectedInputs: FsatInput;

  fsatOptions: Array<{ name: string, fsat: FSAT, index: number }>;

  selectedFsat1: { name: string, fsat: FSAT, index: number };
  selectedFsat2: { name: string, fsat: FSAT, index: number };

  selectedFsat1ExportName: string;
  selectedFsat1PieLabels: Array<string>;
  selectedFsat1PieValues: Array<number>;
  selectedFsat2ExportName: string;
  selectedFsat2PieLabels: Array<string>;
  selectedFsat2PieValues: Array<number>;
  allPieLabels: Array<Array<string>>;
  allPieValues: Array<Array<number>>;

  barLabels: Array<string>;
  selectedFsat1BarValues: Array<number>;
  selectedFsat2BarValues: Array<number>;

  modExists: boolean = false;
  graphColors: Array<string>;

  allChartData: { pieLabels: Array<Array<string>>, pieValues: Array<Array<number>>, barLabels: Array<string>, barValues: Array<Array<number>> };


  constructor(private convertUnitsService: ConvertUnitsService, private fsatService: FsatService) { }

  ngOnInit() {
    this.graphColors = graphColors;
    this.selectedFsat1PieLabels = new Array<string>();
    this.selectedFsat1PieValues = new Array<number>();
    this.selectedFsat2PieLabels = new Array<string>();
    this.selectedFsat2PieValues = new Array<number>();
    this.selectedFsat1BarValues = new Array<number>();
    this.selectedFsat2BarValues = new Array<number>();
    this.barLabels = new Array<string>();
    this.fsatOptions = new Array<{ name: string, fsat: FSAT, index: number }>();
    this.prepFsatOptions();
    this.setBarLabels();
    this.allChartData = this.getAllChartData();
    this.selectNewFsat(1);
    if (this.modExists) {
      this.selectNewFsat(2);
    }
  }


  prepFsatOptions(): void {
    this.fsatOptions.push({ name: 'Baseline', fsat: this.fsat, index: 0 });
    this.selectedFsat1 = this.fsatOptions[0];
    if (this.fsat.modifications !== undefined && this.fsat.modifications !== null) {
      this.modExists = true;
      let i = 1;
      this.fsat.modifications.forEach(mod => {
        this.fsatOptions.push({ name: mod.fsat.name, fsat: mod.fsat, index: i });
        i++;
      });
      this.selectedFsat2 = this.fsatOptions[1];
    }
  }


  setBarLabels(): void {
    this.barLabels.push('Energy Input');
    this.barLabels.push('Motor Losses');
    this.barLabels.push('Drive Losses');
    this.barLabels.push('Fan Losses');
    this.barLabels.push('Useful Output');
  }


  selectNewFsat(dropDownIndex: number): void {
    if (dropDownIndex == 1) {
      this.selectedFsat1PieLabels = this.allChartData.pieLabels[this.selectedFsat1.index];
      this.selectedFsat1PieValues = this.allChartData.pieValues[this.selectedFsat1.index];
      this.selectedFsat1BarValues = this.allChartData.barValues[this.selectedFsat1.index];
      this.selectedFsat1ExportName = this.assessment.name + '-' + this.selectedFsat1.name;
    }
    else if (dropDownIndex == 2) {
      this.selectedFsat2PieLabels = this.allChartData.pieLabels[this.selectedFsat2.index];
      this.selectedFsat2PieValues = this.allChartData.pieValues[this.selectedFsat2.index];
      this.selectedFsat2BarValues = this.allChartData.barValues[this.selectedFsat2.index];
      this.selectedFsat2ExportName = this.assessment.name + '-' + this.selectedFsat2.name;
    }
  }

  getAllChartData(): { pieLabels: Array<Array<string>>, pieValues: Array<Array<number>>, barLabels: Array<string>, barValues: Array<Array<number>> } {
    let allPieLabels = new Array<Array<string>>();
    let allPieValues = new Array<Array<number>>();
    let allBarValues = new Array<Array<number>>();
    let allPieData;

    for (let i = 0; i < this.fsatOptions.length; i++) {
      let energyInput: number, motorLoss: number, driveLoss: number, fanLoss: number, usefulOutput: number;
      let motorShaftPower: number, fanShaftPower: number;
      let tmpPieLabels = new Array<string>();
      let tmpPieValues = new Array<number>();
      let tmpBarValues = new Array<number>();
      let tmpFsat = this.fsatOptions[i].fsat;
      let resultType: string;
      if (i == 0 || (i != 0 && (this.fsatOptions[i].fsat.modifications !== undefined && this.fsatOptions[i].fsat.modifications.length > 0))) {
        resultType = 'existing';
      }
      else {
        resultType = 'modified';
      }
      let tmpOutput = this.fsatService.getResults(this.fsatOptions[i].fsat, resultType, this.settings);

      if (this.settings.fanPowerMeasurement === 'hp') {
        motorShaftPower = this.convertUnitsService.value(tmpOutput.motorShaftPower).from('hp').to('kW');
        fanShaftPower = this.convertUnitsService.value(tmpOutput.fanShaftPower).from('hp').to('kW');

        energyInput = tmpOutput.motorPower;
        motorLoss = energyInput - this.convertUnitsService.value(tmpOutput.motorShaftPower).from('hp').to('kW');
        driveLoss = this.convertUnitsService.value(tmpOutput.motorShaftPower - tmpOutput.fanShaftPower).from('hp').to('kW');
        fanLoss = this.convertUnitsService.value(tmpOutput.fanShaftPower).from('hp').to('kW') * (1 - (tmpOutput.fanEfficiency / 100));
        usefulOutput = this.convertUnitsService.value(tmpOutput.fanShaftPower).from('hp').to('kW') * (tmpOutput.fanEfficiency / 100);
      }
      else {
        motorShaftPower = tmpOutput.motorShaftPower;
        fanShaftPower = tmpOutput.fanShaftPower;

        energyInput = tmpOutput.motorPower;
        motorLoss = tmpOutput.motorPower - tmpOutput.motorShaftPower;
        driveLoss = tmpOutput.motorShaftPower - tmpOutput.fanShaftPower;
        fanLoss = tmpOutput.fanShaftPower * (1 - (tmpOutput.fanEfficiency / 100));
        usefulOutput = tmpOutput.fanShaftPower * (tmpOutput.fanEfficiency / 100);
      }

      tmpPieLabels.push('Motor Loss: ' + (100 * motorLoss / energyInput).toFixed(2).toString() + "%");
      tmpPieValues.push(motorLoss);
      tmpPieLabels.push('Drive Loss: ' + (100 * driveLoss / energyInput).toFixed(2).toString() + "%");
      tmpPieValues.push(driveLoss);
      tmpPieLabels.push('Fan Loss: ' + (100 * fanLoss / energyInput).toFixed(2).toString() + "%");
      tmpPieValues.push(fanLoss);
      tmpPieLabels.push('Useful Output: ' + (100 * usefulOutput / energyInput).toFixed(2).toString() + "%");
      tmpPieValues.push(usefulOutput);

      tmpBarValues.push(energyInput);
      tmpBarValues.push(motorLoss);
      tmpBarValues.push(driveLoss);
      tmpBarValues.push(fanLoss);
      tmpBarValues.push(usefulOutput);

      allPieLabels.push(tmpPieLabels);
      allPieValues.push(tmpPieValues);
      allBarValues.push(tmpBarValues);
    }

    allPieData = {
      pieLabels: allPieLabels,
      pieValues: allPieValues,
      barLabels: this.barLabels,
      barValues: allBarValues
    }
    return allPieData;
  }

  getPieWidth(): number {
    if (this.pieChartContainer) {
      let containerPadding = 50;
      return this.pieChartContainer.nativeElement.clientWidth - containerPadding;
    }
    else {
      return 0;
    }
  }

  getBarWidth(): number {
    if (this.barChartContainer) {
      let containerPadding = 30;
      return this.barChartContainer.nativeElement.clientWidth - containerPadding;
    }
    else {
      return 0;
    }
  }

}
