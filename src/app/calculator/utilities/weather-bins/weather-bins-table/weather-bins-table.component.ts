import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { WeatherBinsInput, WeatherBinsService } from '../weather-bins.service';

@Component({
  selector: 'app-weather-bins-table',
  templateUrl: './weather-bins-table.component.html',
  styleUrls: ['./weather-bins-table.component.css']
})
export class WeatherBinsTableComponent implements OnInit {
  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;

  @Input()
  inputData: WeatherBinsInput;

  constructor() { }

  ngOnInit(): void {
    
  }

  ngOnDestroy() {
    
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }

}
