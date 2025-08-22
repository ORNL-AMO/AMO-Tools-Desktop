import { Component } from '@angular/core';
import { CompressedAirInventoryService } from '../../compressed-air-inventory.service';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-performance-points-help',
  templateUrl: './performance-points-help.component.html',
  styleUrl: './performance-points-help.component.css',
  standalone: false
})
export class PerformancePointsHelpComponent {

  focusedField: string;
  focusedFieldSub: Subscription;
  settings: Settings;

  constructor(private compressedAirInventoryService: CompressedAirInventoryService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirInventoryService.settings.getValue();
    this.focusedFieldSub = this.compressedAirInventoryService.focusedField.subscribe(val => {
      this.focusedField = val;
    });
  }

  ngOnDestroy() {
    this.focusedFieldSub.unsubscribe();
  }

}
