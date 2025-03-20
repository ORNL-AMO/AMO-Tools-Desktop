import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CoolingTowerFanOutput } from '../../../../shared/models/chillers';
import { Settings } from '../../../../shared/models/settings';
import { CoolingTowerFanService } from '../cooling-tower-fan.service';

@Component({
    selector: 'app-cooling-tower-fan-results',
    templateUrl: './cooling-tower-fan-results.component.html',
    styleUrls: ['./cooling-tower-fan-results.component.css'],
    standalone: false
})
export class CoolingTowerFanResultsComponent implements OnInit {


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
  output: CoolingTowerFanOutput;

  constructor(private coolingTowerFanService: CoolingTowerFanService) { }

  ngOnInit(): void {
    this.outputSubscription = this.coolingTowerFanService.coolingTowerFanOutput.subscribe(val => {
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