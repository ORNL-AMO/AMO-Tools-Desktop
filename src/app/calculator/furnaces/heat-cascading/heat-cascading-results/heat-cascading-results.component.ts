import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { HeatCascadingOutput } from '../../../../shared/models/phast/heatCascading';
import { Settings } from '../../../../shared/models/settings';
import { HeatCascadingService } from '../heat-cascading.service';

@Component({
    selector: 'app-heat-cascading-results',
    templateUrl: './heat-cascading-results.component.html',
    styleUrls: ['./heat-cascading-results.component.css'],
    standalone: false
})
export class HeatCascadingResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inTreasureHunt: boolean;
  
  displayAdditionalResults: boolean = true;

  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: any;
  @ViewChild('copyTable1', { static: false }) copyTable1: ElementRef;
  table1String: any;
  
  outputSubscription: Subscription;
  output: HeatCascadingOutput;
  
  constructor(private heatCascadingService: HeatCascadingService) { }

  ngOnInit(): void {
    this.displayAdditionalResults = !this.inTreasureHunt;
    this.outputSubscription = this.heatCascadingService.heatCascadingOutput.subscribe(val => {
      this.output = val;
    });

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
