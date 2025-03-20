import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { FeedwaterEconomizerOutput } from '../../../../shared/models/steam/feedwaterEconomizer';
import { FeedwaterEconomizerService } from '../feedwater-economizer.service';

@Component({
    selector: 'app-feedwater-economizer-results',
    templateUrl: './feedwater-economizer-results.component.html',
    styleUrls: ['./feedwater-economizer-results.component.css'],
    standalone: false
})
export class FeedwaterEconomizerResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: any;
  @ViewChild('copyTable1', { static: false }) copyTable1: ElementRef;
  table1String: any;

  outputSubscription: Subscription;
  output: FeedwaterEconomizerOutput;
  
  constructor(private feedWaterEconomizerService: FeedwaterEconomizerService) { }

  ngOnInit(): void {
    this.outputSubscription = this.feedWaterEconomizerService.feedwaterEconomizerOutput.subscribe(val => {
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


}