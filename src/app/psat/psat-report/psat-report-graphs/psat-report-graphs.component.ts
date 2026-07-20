import { Component, inject, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { PSAT, PsatOutputs, Modification } from '../../../shared/models/psat';
import { PsatChartsService } from '../../services/psat-charts.service';

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

  private readonly psatChartsService = inject(PsatChartsService);

  ngOnInit() {
    this.setAllChartData();
    this.barChartYAxisLabel = 'Power (kW)';
  }

  setAllChartData() {
    this.allChartData = [];
    this.addChartData(this.psat.outputs, this.psat.name);
    this.selectedBaselineData = this.allChartData[0];
    if (this.psat.modifications && this.psat.modifications.length !== 0) {
      this.psat.modifications.forEach(modification => {
        this.addChartData(modification.psat.outputs, modification.psat.name, modification);
      });
      if (this.allChartData.length > 1) {
        this.selectedModificationData = this.allChartData[1];
      }
    }
  }

  addChartData(outputs: PsatOutputs, name: string, modification?: Modification) {
    const d = this.psatChartsService.computeOutputGraphData(outputs, this.settings);
    this.allChartData.push({
      name,
      valuesAndLabels: [
        { value: d.motorLoss,    label: 'Motor Losses' },
        { value: d.driveLoss,    label: 'Drive Losses' },
        { value: d.pumpLoss,     label: 'Pump Losses' },
        { value: d.usefulOutput, label: 'Useful Output' },
      ],
      barChartLabels: ['Energy Input', 'Motor Losses', 'Drive Losses', 'Pump Losses', 'Useful Output'],
      barChartValues: [d.energyInput, d.motorLoss, d.driveLoss, d.pumpLoss, d.usefulOutput],
      modification,
      isValid: modification ? modification.psat.valid.isValid : true,
    });
  }

}
