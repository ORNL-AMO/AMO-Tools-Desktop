import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AirHeatingOutput } from '../../../../shared/models/phast/airHeating';
import { Settings } from '../../../../shared/models/settings';
import { AirHeatingService } from '../air-heating.service';

@Component({
  selector: 'app-air-heating-results',
  templateUrl: './air-heating-results.component.html',
  styleUrls: ['./air-heating-results.component.css']
})
export class AirHeatingResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  
  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: any;
  
  outputSubscription: Subscription;
  output: AirHeatingOutput;

  
  constructor(private airHeatingService: AirHeatingService) { }

  ngOnInit(): void {
    this.outputSubscription = this.airHeatingService.airHeatingOutput.subscribe(val => {
      this.output = val;
    })
  }

  ngOnDestroy() {
    this.outputSubscription.unsubscribe();
  }

  updateTable0String() {
    this.table0String = this.copyTable0.nativeElement.innerText;
  }

}
