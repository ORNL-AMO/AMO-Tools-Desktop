import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ValveEnergyLossResults } from '../../../../shared/models/calculators';
import { Settings } from '../../../../shared/models/settings';
import { ValveEnergyLossService } from '../valve-energy-loss.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-valve-energy-loss-results',
  templateUrl: './valve-energy-loss-results.component.html',
  styleUrl: './valve-energy-loss-results.component.css',
  standalone: false
})
export class ValveEnergyLossResultsComponent implements OnInit {

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
  output: ValveEnergyLossResults;

  constructor(private valveEnergyLossService: ValveEnergyLossService) { }

  ngOnInit(): void {
    this.outputSubscription = this.valveEnergyLossService.results.subscribe(val => {
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

  updateTable2String() {
    this.table2String = this.copyTable2.nativeElement.innerText;
  }

}
