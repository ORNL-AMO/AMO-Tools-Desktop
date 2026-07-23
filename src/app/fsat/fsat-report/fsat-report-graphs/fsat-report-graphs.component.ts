import { Component, inject, OnInit, Input } from '@angular/core';
import { FSAT, FsatOutput, Modification, FsatValid } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { FsatChartsService } from '../../services/fsat-charts.service';
@Component({
    selector: 'app-fsat-report-graphs',
    templateUrl: './fsat-report-graphs.component.html',
    styleUrls: ['./fsat-report-graphs.component.css'],
    standalone: false
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

  private readonly fsatChartsService = inject(FsatChartsService);

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
    const data = this.fsatChartsService.computeOutputGraphData(results, this.settings);
    this.allChartData.push({
      name,
      valuesAndLabels: [
        { value: data.motorLoss, label: 'Motor Losses' },
        { value: data.driveLoss, label: 'Drive Losses' },
        { value: data.fanLoss, label: 'Fan Losses' },
        { value: data.usefulOutput, label: 'Useful Output' },
      ],
      barChartLabels: ['Energy Input', 'Motor Losses', 'Drive Losses', 'Fan Losses', 'Useful Output'],
      barChartValues: [data.energyInput, data.motorLoss, data.driveLoss, data.fanLoss, data.usefulOutput],
      modification,
      valid: isValid,
    });
  }

}
