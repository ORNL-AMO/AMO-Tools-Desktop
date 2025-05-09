import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CoolingLossOutput } from '../../../../shared/models/phast/losses/coolingLoss';
import { Settings } from '../../../../shared/models/settings';
import { CoolingService } from '../cooling.service';

@Component({
    selector: 'app-cooling-results',
    templateUrl: './cooling-results.component.html',
    styleUrls: ['./cooling-results.component.css'],
    standalone: false
})
export class CoolingResultsComponent implements OnInit {

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
  output: CoolingLossOutput;

  constructor(private coolingService: CoolingService) { }

  ngOnInit(): void {
    this.outputSubscription = this.coolingService.output.subscribe(val => {
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
    this.table2String = this.copyTable2.nativeElement.innerText;
  }

}