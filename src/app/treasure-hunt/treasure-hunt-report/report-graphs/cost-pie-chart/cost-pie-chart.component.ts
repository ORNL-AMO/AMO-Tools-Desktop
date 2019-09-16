import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { TreasureHuntResults } from '../../../../shared/models/treasure-hunt';
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
  @ViewChild('pieChartElement') pieChartElement: ElementRef;

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
    if (this.isBaseline == true) {
      this.addColumnItem('Electricity ', this.treasureHuntResults.electricity.baselineEnergyCost);
      this.addColumnItem('Natural Gas ', this.treasureHuntResults.naturalGas.baselineEnergyCost);
      this.addColumnItem('Water ', this.treasureHuntResults.water.baselineEnergyCost);
      this.addColumnItem('Waste Water ', this.treasureHuntResults.wasteWater.baselineEnergyCost);
      this.addColumnItem('Other Fuel ', this.treasureHuntResults.otherFuel.baselineEnergyCost);
      this.addColumnItem('Compressed Air ', this.treasureHuntResults.compressedAir.baselineEnergyCost);
      this.addColumnItem('Steam ', this.treasureHuntResults.steam.baselineEnergyCost);
      this.addColumnItem('Other ', this.treasureHuntResults.other.baselineEnergyCost);
    } else {
      this.addColumnItem('Electricity ', this.treasureHuntResults.electricity.modifiedEnergyCost);
      this.addColumnItem('Natural Gas ', this.treasureHuntResults.naturalGas.modifiedEnergyCost);
      this.addColumnItem('Water ', this.treasureHuntResults.water.modifiedEnergyCost);
      this.addColumnItem('Waste Water ', this.treasureHuntResults.wasteWater.modifiedEnergyCost);
      this.addColumnItem('Other Fuel ', this.treasureHuntResults.otherFuel.modifiedEnergyCost);
      this.addColumnItem('Compressed Air ', this.treasureHuntResults.compressedAir.modifiedEnergyCost);
      this.addColumnItem('Steam ', this.treasureHuntResults.steam.modifiedEnergyCost);
      this.addColumnItem('Other ', this.treasureHuntResults.other.modifiedEnergyCost);
    }
  }

  addColumnItem(label: string, value: number) {
    if (value) {
      this.columnData.push([label, value]);
    }
  }

  initChart() {
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
    if (this.showPrint) {
      this.chart.resize({ height: 250, width: 500 });
    }
  }


}
