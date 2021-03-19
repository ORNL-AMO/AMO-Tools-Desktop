import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { WasteHeatOutput } from '../../../../shared/models/phast/wasteHeat';
import { Settings } from '../../../../shared/models/settings';
import { WasteHeatService } from '../waste-heat.service';

@Component({
  selector: 'app-waste-heat-results',
  templateUrl: './waste-heat-results.component.html',
  styleUrls: ['./waste-heat-results.component.css']
})
export class WasteHeatResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: any;

  outputSubscription: Subscription;
  output: WasteHeatOutput;
  
  constructor(private wasteHeatService: WasteHeatService) { }

  ngOnInit(): void {
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
}
