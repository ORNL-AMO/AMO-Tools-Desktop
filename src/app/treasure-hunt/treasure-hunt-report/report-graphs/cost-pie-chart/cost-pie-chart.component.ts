import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { TreasureHuntResults, UtilityUsageData } from '../../../../shared/models/treasure-hunt';
import * as c3 from 'c3';

@Component({
  selector: 'app-cost-pie-chart',
  templateUrl: './cost-pie-chart.component.html',
  styleUrls: ['./cost-pie-chart.component.css']
})
export class CostPieChartComponent implements OnInit {
  @Input()
  treasureHuntResults: TreasureHuntResults;
  @Input()
  isBaseline: boolean;
  @Input()
  showPrint: boolean;

  chart: any;
  @ViewChild('pieChartElement', { static: false }) pieChartElement: ElementRef;

  columnData: Array<any>;

  constructor() { }

  ngOnInit() {
    this.getColumnData();
  }

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnDestroy() { }

  getColumnData() {
    this.columnData = new Array();
    this.addColumnItem('Electricity ', this.treasureHuntResults.electricity, this.isBaseline);
    this.addColumnItem('Natural Gas ', this.treasureHuntResults.naturalGas, this.isBaseline);
    this.addColumnItem('Water ', this.treasureHuntResults.water, this.isBaseline);
    this.addColumnItem('Waste Water ', this.treasureHuntResults.wasteWater, this.isBaseline);
    this.addColumnItem('Other Fuel ', this.treasureHuntResults.otherFuel, this.isBaseline);
    this.addColumnItem('Compressed Air ', this.treasureHuntResults.compressedAir, this.isBaseline);
    this.addColumnItem('Steam ', this.treasureHuntResults.steam, this.isBaseline);
    this.addColumnItem('Other ', this.treasureHuntResults.other, this.isBaseline);
  }

  addColumnItem(label: string, value: UtilityUsageData, isBaseline: boolean) {
    if (isBaseline && value.baselineEnergyCost) {
      this.columnData.push([label, value.baselineEnergyCost]);
    } else if (!isBaseline && value.modifiedEnergyCost) {
      this.columnData.push([label, value.modifiedEnergyCost]);
    }
  }

  initChart() {

    if (this.showPrint) {
      this.chart = c3.generate({
        bindto: this.pieChartElement.nativeElement,
        data: {
          type: 'pie',
          columns: this.columnData
        },
        legend: {
          position: 'right'
        },
        size: {
          height: 300,
          width: 450
        }
        // legend: {
        //   show: false
        // },
        // color: {
        //   pattern: ['#52489C', '#3498DB', '#6DAFA9', '#60B044', '#FF0000'], // the three color levels for the percentage values.
        //   threshold: {
        //     values: [25, 50]
        //   }
        // },
        // tooltip: {
        //   show: false
        // },
      });
    } else {
      this.chart = c3.generate({
        bindto: this.pieChartElement.nativeElement,
        data: {
          type: 'pie',
          columns: this.columnData
        },
        legend: {
          position: 'right'
        }
        // legend: {
        //   show: false
        // },
        // color: {
        //   pattern: ['#52489C', '#3498DB', '#6DAFA9', '#60B044', '#FF0000'], // the three color levels for the percentage values.
        //   threshold: {
        //     values: [25, 50]
        //   }
        // },
        // tooltip: {
        //   show: false
        // },
      });
    }
  }


}
