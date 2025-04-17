import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { ChillerStagingOutput } from '../../../../shared/models/chillers';
import { Settings } from '../../../../shared/models/settings';
import { ChillerStagingService } from '../chiller-staging.service';

@Component({
    selector: 'app-chiller-staging-results',
    templateUrl: './chiller-staging-results.component.html',
    styleUrls: ['./chiller-staging-results.component.css'],
    standalone: false
})
export class ChillerStagingResultsComponent implements OnInit {

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
  output: ChillerStagingOutput;

  constructor(private chillerStagingService: ChillerStagingService) { }

  ngOnInit(): void {
    this.outputSubscription = this.chillerStagingService.chillerStagingOutput.subscribe(val => {
      this.output = val;
    })
  }

  ngOnDestroy() {
    this.outputSubscription.unsubscribe();
  }

  updateTable0String() {
    this.table0String = this.copyTable0.nativeElement.innerText + this.copyTable1.nativeElement.innerText + this.copyTable2.nativeElement.innerText;
  }

}