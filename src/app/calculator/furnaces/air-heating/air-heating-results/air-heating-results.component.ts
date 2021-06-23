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
  @Input()
  inTreasureHunt: boolean;
  
  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: any;
  @ViewChild('copyTable1', { static: false }) copyTable1: ElementRef;
  table1String: any;
  
  outputSubscription: Subscription;
  output: AirHeatingOutput;
  displayAdditionalResults: boolean = true;

  
  constructor(private airHeatingService: AirHeatingService) { }

  ngOnInit(): void {
    this.displayAdditionalResults = !this.inTreasureHunt;
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

  updateTable1String() {
    this.table1String = this.copyTable1.nativeElement.innerText;
  }

  toggleResults() {
    this.displayAdditionalResults = !this.displayAdditionalResults;
  }
}
