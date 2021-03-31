import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { WaterHeatingOutput } from '../../../../shared/models/steam/waterHeating';
import { WaterHeatingService } from '../water-heating.service';

@Component({
  selector: 'app-water-heating-results',
  templateUrl: './water-heating-results.component.html',
  styleUrls: ['./water-heating-results.component.css']
})
export class WaterHeatingResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: any;

  outputSubscription: Subscription;
  output: WaterHeatingOutput;
  
  constructor(private waterHeatingService: WaterHeatingService) { }

  ngOnInit(): void {
    this.outputSubscription = this.waterHeatingService.waterHeatingOutput.subscribe(val => {
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