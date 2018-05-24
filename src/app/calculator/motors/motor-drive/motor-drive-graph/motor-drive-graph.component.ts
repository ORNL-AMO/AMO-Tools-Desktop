import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { MotorDriveOutputs } from '../motor-drive.component';
import * as c3 from 'c3';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';

@Component({
  selector: 'app-motor-drive-graph',
  templateUrl: './motor-drive-graph.component.html',
  styleUrls: ['./motor-drive-graph.component.css']
})
export class MotorDriveGraphComponent implements OnInit {
  @Input()
  results: MotorDriveOutputs;

  @ViewChild("ngChart") ngChart: ElementRef;

  barChart: any;
  graphColors: Array<string>;
  selectedGraphType: string = 'energyCost';

  constructor() { }

  ngOnInit() {
    this.graphColors = graphColors;
  }

  ngAfterViewInit() {
    this.buildChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.results && !changes.results.firstChange) {
      this.buildChart();
    }
  }

  setType(str: string) {
    if (str != this.selectedGraphType) {
      this.selectedGraphType = str;
      this.buildChart();
    }
  }

  buildChart() {
    let unit: string;
    let columnData: Array<Array<any>>;

    if (this.selectedGraphType == 'energyCost') {
      columnData = [
        ['V Belt Drive', this.results.vBeltResults.energyCost],
        ['Notched V Belt Drive', this.results.notchedResults.energyCost],
        ['Synchronous Belt Drive', this.results.synchronousBeltDrive.energyCost]
      ]
      unit = '$k/yr';
    } else if (this.selectedGraphType == 'energyUse') {
      columnData = [
        ['V Belt Drive', this.results.vBeltResults.annualEnergyUse],
        ['Notched V Belt Drive', this.results.notchedResults.annualEnergyUse],
        ['Synchronous Belt Drive', this.results.synchronousBeltDrive.annualEnergyUse]
      ]
      unit = 'MWh/yr';
    }
    this.barChart = c3.generate({
      bindto: this.ngChart.nativeElement,
      data: {
        columns: columnData,
        type: 'bar',
      },
      grid: {
        y: {
          show: true
        }
      },
      color: {
        pattern: this.graphColors
      },
      legend: {
        show: true,
        position: 'bottom'
      },
      bar: {
        width: {
          ratio: .5
        }
      },
      axis: {
        y: {
          label: {
            text: unit,
            position: 'outer-middle'
          }
        },
        x: {
          tick: {
            values: ['']
          }
        }
      },
      tooltip: {
        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
          let styling = "background-color: rgba(0, 0, 0, 0.7); border-radius: 5px; color: #fff; padding: 3px; font-size: 13px; display: inline-block; white-space: nowrap;";
          let html = "<div style='" + styling + "'>"
            + "<table>"
            + "<tr>"
            + "<td>"
            + d[0].name + ": "
            + "</td>"
            + "<td style='text-align: right; font-weight: bold'>"
            + Math.round(d[0].value) + " " + unit
            + "</td>"
            + "</tr>"
            + "<tr>";

          if (d[1]) {
            html = html
              + "<td>"
              + d[1].name + ": "
              + "</td>"
              + "<td style='text-align: right; font-weight: bold'>"
              + Math.round(d[1].value) + " " + unit
              + "</td>"
              + "</tr>"
          }
          if (d[2]) {
            html = html
              + "<td>"
              + d[2].name + ": "
              + "</td>"
              + "<td style='text-align: right; font-weight: bold'>"
              + Math.round(d[2].value) + " " + unit
              + "</td>"
              + "</tr>"
          }
          html = html + "</table></div>";
          return html;
        }
      }
    });
  }


}
