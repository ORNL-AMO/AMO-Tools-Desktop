import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import * as c3 from 'c3';
import { OpportunitiesPaybackDetails } from '../../../../shared/models/treasure-hunt';

@Component({
  selector: 'app-opportunity-payback-donut',
  templateUrl: './opportunity-payback-donut.component.html',
  styleUrls: ['./opportunity-payback-donut.component.css']
})
export class OpportunityPaybackDonutComponent implements OnInit {
  @Input()
  opportunitiesPaybackDetails: OpportunitiesPaybackDetails;
  @Input()
  showPrint: boolean;

  chart: any;
  @ViewChild('donutChartElement', { static: false }) donutChartElement: ElementRef;
  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnChanges(){
    if(this.chart){
      this.initChart();
    }
  }

  ngOnDestroy() { }

  initChart() {
    if (this.showPrint) {
      this.chart = c3.generate({
        bindto: this.donutChartElement.nativeElement,
        data: {
          type: 'donut',
          columns: [
            ['Less than 1 Year ', this.opportunitiesPaybackDetails.lessThanOneYear.totalSavings],
            ['1 to 2 Years ', this.opportunitiesPaybackDetails.oneToTwoYears.totalSavings],
            ['2 to 3 Years ', this.opportunitiesPaybackDetails.twoToThreeYears.totalSavings],
            ['More than 3 Years ', this.opportunitiesPaybackDetails.moreThanThreeYears.totalSavings],
          ]
        },
        size: {
          width: 850,
          height: 350
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
        bindto: this.donutChartElement.nativeElement,
        data: {
          type: 'donut',
          columns: [
            ['Less than 1 Year ', this.opportunitiesPaybackDetails.lessThanOneYear.totalSavings],
            ['1 to 2 Years ', this.opportunitiesPaybackDetails.oneToTwoYears.totalSavings],
            ['2 to 3 Years ', this.opportunitiesPaybackDetails.twoToThreeYears.totalSavings],
            ['More than 3 Years ', this.opportunitiesPaybackDetails.moreThanThreeYears.totalSavings],
          ]
        },
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
