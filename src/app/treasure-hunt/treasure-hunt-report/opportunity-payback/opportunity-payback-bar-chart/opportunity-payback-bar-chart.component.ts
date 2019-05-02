import { Component, OnInit, Input, ElementRef, ViewChild, HostListener, SimpleChanges } from '@angular/core';
import * as c3 from 'c3';
import { OpportunitiesPaybackDetails } from '../../../../shared/models/treasure-hunt';
@Component({
  selector: 'app-opportunity-payback-bar-chart',
  templateUrl: './opportunity-payback-bar-chart.component.html',
  styleUrls: ['./opportunity-payback-bar-chart.component.css']
})
export class OpportunityPaybackBarChartComponent implements OnInit {
  @Input()
  opportunitiesPaybackDetails: OpportunitiesPaybackDetails;

  chart: any;
  @ViewChild('barChartElement') barChartElement: ElementRef;
  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnDestroy() { }

  initChart() {
    this.chart = c3.generate({
      bindto: this.barChartElement.nativeElement,
      data: {
        type: 'bar',
        columns: [
          ['Less than 1 Year ', this.opportunitiesPaybackDetails.lessThanOneYear.totalSavings],
          ['1 to 2 Years ', this.opportunitiesPaybackDetails.oneToTwoYears.totalSavings],
          ['2 to 3 Years ', this.opportunitiesPaybackDetails.twoToThreeYears.totalSavings],
          ['More than 3 Years ', this.opportunitiesPaybackDetails.moreThanThreeYears.totalSavings],
        ]
      },
      axis: {
        // x: {
        //   label: {
        //     show: false
        //   },
        //   tick: {
        //     type: 'category',
        //     categories:  ['Payback Period'] 
        //   }
        // },
        y: {
          label: {
            text: "Cost Savings ($)",
            position: 'outer-middle'
          },
          tick: {
            format: function (d) { return '$ ' + (d).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'); }
          }
        }
      },
      grid: {
        y: {
          show: true
        }
      },
      tooltip: {
        show: false
      }
    });
  }

}
