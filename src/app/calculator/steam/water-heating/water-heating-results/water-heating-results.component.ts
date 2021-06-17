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
  @ViewChild('copyTable1', { static: false }) copyTable1: ElementRef;
  table1String: any;
  @ViewChild('copyTable2', { static: false }) energySavedTotal: ElementRef;
  table2String: any;

  displayAdditionalResults: boolean = true;

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

  updateTable1String() {
    this.table1String = this.copyTable1.nativeElement.innerText;
  }

  updateTable2String() {
    this.table2String = this.energySavedTotal.nativeElement.innerText;
  }

}