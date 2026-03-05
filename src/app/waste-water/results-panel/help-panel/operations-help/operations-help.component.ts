import { Component, inject, OnInit, Signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { WasteWaterService } from '../../../waste-water.service';
import { FeatureFlagService } from '../../../../shared/feature-flag.service';

@Component({
    selector: 'app-operations-help',
    templateUrl: './operations-help.component.html',
    styleUrls: ['./operations-help.component.css'],
    standalone: false
})
export class OperationsHelpComponent implements OnInit {
  private featureFlagService = inject(FeatureFlagService);
  showOperationalImpacts: Signal<boolean> = this.featureFlagService.showOperationalImpacts;

  focusedField: string;
  focusedFieldSub: Subscription;
  constructor(private wasteWaterService:WasteWaterService) { }

  ngOnInit(): void {
    this.focusedFieldSub = this.wasteWaterService.focusedField.subscribe(val => {
      this.focusedField = val;
    });
  }

  ngOnDestroy(){
    this.focusedFieldSub.unsubscribe();
  }

}
