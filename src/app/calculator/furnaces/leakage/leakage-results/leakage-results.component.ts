import { ElementRef, Input } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { LeakageLossOutput } from '../../../../shared/models/phast/losses/leakageLoss';
import { Settings } from '../../../../shared/models/settings';
import { LeakageService } from '../leakage.service';

@Component({
  selector: 'app-leakage-results',
  templateUrl: './leakage-results.component.html',
  styleUrls: ['./leakage-results.component.css']
})
export class LeakageResultsComponent implements OnInit {

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
  output: LeakageLossOutput;

  constructor(private leakageService: LeakageService) { }

  ngOnInit(): void {
    this.outputSubscription = this.leakageService.output.subscribe(val => {
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