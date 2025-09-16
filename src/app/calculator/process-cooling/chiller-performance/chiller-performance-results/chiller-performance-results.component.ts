import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChillerPerformanceOutput } from '../../../../shared/models/chillers';
import { Settings } from '../../../../shared/models/settings';
import { ChillerPerformanceService } from '../chiller-performance.service';

@Component({
    selector: 'app-chiller-performance-results',
    templateUrl: './chiller-performance-results.component.html',
    styleUrls: ['./chiller-performance-results.component.css'],
    standalone: false
})
export class ChillerPerformanceResultsComponent implements OnInit {


  @Input()
  settings: Settings;
  @Input()
  modificationExists: boolean;

  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: any;
  @ViewChild('copyTable1', { static: false }) copyTable1: ElementRef;
  table1String: any;
  @ViewChild('copyTable2', { static: false }) copyTable2: ElementRef;
  table2String: any;

  outputSubscription: Subscription;
  output: ChillerPerformanceOutput;

  constructor(private chillerPerformanceService: ChillerPerformanceService) { }

  ngOnInit(): void {
    this.outputSubscription = this.chillerPerformanceService.chillerPerformanceOutput.subscribe(updatedOutput => {
      // TODO handle array
      this.output = updatedOutput;
    })
  }

  ngOnDestroy() {
    this.outputSubscription.unsubscribe();
  }

  updateTable0String() {
    this.table0String = this.copyTable0.nativeElement.innerText + this.copyTable1.nativeElement.innerText + this.copyTable2.nativeElement.innerText;
  }

}