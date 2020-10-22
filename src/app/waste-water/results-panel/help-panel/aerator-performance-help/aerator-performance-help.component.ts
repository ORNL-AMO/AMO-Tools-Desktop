import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WasteWaterService } from '../../../waste-water.service';

@Component({
  selector: 'app-aerator-performance-help',
  templateUrl: './aerator-performance-help.component.html',
  styleUrls: ['./aerator-performance-help.component.css']
})
export class AeratorPerformanceHelpComponent implements OnInit {

  focusedField: string;
  focusedFieldSub: Subscription;
  constructor(private wasteWaterService: WasteWaterService) { }

  ngOnInit(): void {
    this.focusedFieldSub = this.wasteWaterService.focusedField.subscribe(val => {
      this.focusedField = val;
    });
  }

  ngOnDestroy(){
    this.focusedFieldSub.unsubscribe();
  }
}
