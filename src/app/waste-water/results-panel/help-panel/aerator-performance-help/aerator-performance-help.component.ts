import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WasteWaterService } from '../../../waste-water.service';
import { StandardSOTRValues } from './standardSOTRValues';
@Component({
  selector: 'app-aerator-performance-help',
  templateUrl: './aerator-performance-help.component.html',
  styleUrls: ['./aerator-performance-help.component.css']
})
export class AeratorPerformanceHelpComponent implements OnInit {

  focusedField: string;
  focusedFieldSub: Subscription;

  standardSOTRValues: Array<{ label: string, value: number }>;
  constructor(private wasteWaterService: WasteWaterService) { }

  ngOnInit(): void {
    this.standardSOTRValues = StandardSOTRValues;
    this.focusedFieldSub = this.wasteWaterService.focusedField.subscribe(val => {
      this.focusedField = val;
    });
  }

  ngOnDestroy(){
    this.focusedFieldSub.unsubscribe();
  }
}
