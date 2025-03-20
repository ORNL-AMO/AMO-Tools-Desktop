import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { WasteHeatOutput } from '../../../../shared/models/phast/wasteHeat';
import { Settings } from '../../../../shared/models/settings';
import { WasteHeatService } from '../waste-heat.service';

@Component({
    selector: 'app-waste-heat-results',
    templateUrl: './waste-heat-results.component.html',
    styleUrls: ['./waste-heat-results.component.css'],
    standalone: false
})
export class WasteHeatResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inTreasureHunt: boolean;
  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: string;
  @ViewChild('copyTable1', { static: false }) copyTable1: ElementRef;
  table1String: string;
  
  displayAdditionalResults: boolean = true;

  outputSubscription: Subscription;
  output: WasteHeatOutput;
  
  constructor(private wasteHeatService: WasteHeatService) { }

  ngOnInit(): void {
    this.displayAdditionalResults = !this.inTreasureHunt;
    this.outputSubscription = this.wasteHeatService.wasteHeatOutput.subscribe(val => {
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

  toggleResults() {
    this.displayAdditionalResults = !this.displayAdditionalResults;
  }
}
