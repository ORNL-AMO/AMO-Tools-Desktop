import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { WeatherBinsInput, WeatherBinsService } from '../weather-bins.service';

@Component({
  selector: 'app-weather-bins-table',
  templateUrl: './weather-bins-table.component.html',
  styleUrls: ['./weather-bins-table.component.css']
})
export class WeatherBinsTableComponent implements OnInit {
  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  @Input() settings: Settings;
  tableString: any;
  inputData: WeatherBinsInput;
  inputDataSub: Subscription;
  totalCaseDataPoints: number;
  constructor(private weatherBinsService: WeatherBinsService) { }

  ngOnInit(): void {   
    this.inputDataSub = this.weatherBinsService.inputData.subscribe(inputData => {      
      this.inputData = inputData;
    }); 
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }

}
