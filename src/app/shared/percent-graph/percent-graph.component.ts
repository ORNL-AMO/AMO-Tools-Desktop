import { Component, OnInit, Input, SimpleChange } from '@angular/core';
import { WindowRefService } from '../../indexedDb/window-ref.service';
@Component({
  selector: 'app-percent-graph',
  templateUrl: './percent-graph.component.html',
  styleUrls: ['./percent-graph.component.css']
})
export class PercentGraphComponent implements OnInit {
  @Input()
  value: number;
  @Input()
  title: string;
  @Input()
  valueDescription: string;
  @Input()
  titlePlacement: string;
  @Input()
  fontStyle: string;
  @Input()
  fontSize: number;
  @Input()
  unit: string;

  doughnutChartLabels: string[];
  doughnutChartData: number[];
  doughnutChartType: string = 'doughnut';
  chartOptions: any;
  chartColors: Array<any> = [{}];
  chartColorDataSet: Array<any>;

  potential: number = 0;

  doc: any;
  window: any;

  constructor(private windowRefService: WindowRefService) { }

  ngOnInit() {
    this.initChart();
  }

  ngAfterViewInit() {
    this.doc = this.windowRefService.getDoc();
    this.window = this.windowRefService.nativeWindow;
    this.window.onresize = () => { this.setValueMargin() };
    this.setValueMargin();
  }

  ngOnDestroy() {
    this.window.onresize = null;
  }

  setValueMargin() {
    let div = this.doc.getElementsByClassName('chart-container')
    let percentValue = this.doc.getElementById('percent');
    let valueClass = this.doc.getElementsByClassName('value');
    if (div[0].clientHeight < 350 && div[0].clientHeight > 200) {
      for (let i = 0; i < valueClass.length; i++) {
        valueClass[i].style.fontSize = '24px';
      }
    } else if (div[0].clientHeight < 200) {
      for (let i = 0; i < valueClass.length; i++) {
        valueClass[i].style.fontSize = '16px';
      }
    } else {
      for (let i = 0; i < valueClass.length; i++) {
        valueClass[i].style.fontSize = '32px';
      }
    }
    let marginTop = (div[0].clientHeight / 2) - (percentValue.clientHeight + (percentValue.clientHeight * .5));
    let marginLeft = (div[0].clientWidth / 2) - (percentValue.clientWidth / 2);
    for (let i = 0; i < valueClass.length; i++) {
      valueClass[i].style.marginTop = (marginTop+25) + 'px';
      valueClass[i].style.marginLeft = marginLeft + 'px';
    }
  }

  ngOnChanges() {
    this.initChart();
  }

  initChart() {
    this.chartOptions = {
      legend: {
        display: false
      },
      title: {
        text: this.title,
        display: true,
        position: this.titlePlacement || "bottom",
        fontStyle: this.fontStyle || "bold",
        fontSize: this.fontSize || 22
      }
    }
    this.doughnutChartLabels = [this.valueDescription, 'Potential']
    if (this.value < 100) {
      this.potential = 100 - this.value;
    }
    this.doughnutChartData = [this.value, this.potential];
    if (this.value >= 70 && this.value <= 100) {
      this.chartColorDataSet = [
        {
          options: this.chartOptions,
          data: this.doughnutChartData,
          backgroundColor: [
            "#27AE60",
            "#CCD1D1"
          ],
          hoverBackground: [
            "#229954",
            "#B2BABB"
          ]
        }
      ]
    } else if (this.value < 70 && this.value >= 50) {
      this.chartColorDataSet = [
        {
          options: this.chartOptions,
          data: this.doughnutChartData,
          backgroundColor: [
            "#EB984E",
            "#CCD1D1"

          ],
          hoverBackground: [
            "#DC7633",
            "#B2BABB"
          ]
        }
      ]
    } else if (this.value > 100) {
      this.chartColorDataSet = [
        {
          options: this.chartOptions,
          data: this.doughnutChartData,
          backgroundColor: [
            "#3498DB",
            "#CCD1D1"

          ],
          hoverBackground: [
            "#DC7633",
            "#B2BABB"
          ]
        }
      ]
    } else {
      this.chartColorDataSet = [
        {
          options: this.chartOptions,
          data: this.doughnutChartData,
          backgroundColor: [
            "#E74C3C",
            "#CCD1D1"

          ],
          hoverBackground: [
            "#DC7633",
            "#CB4335"
          ]
        }
      ]
    }
  }
}
