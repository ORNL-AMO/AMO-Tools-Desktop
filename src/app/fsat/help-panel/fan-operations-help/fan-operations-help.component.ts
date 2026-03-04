import { Component, inject, Input, OnInit, Signal } from '@angular/core';
import { FeatureFlagService } from '../../../shared/feature-flag.service';

@Component({
    selector: 'app-fan-operations-help',
    templateUrl: './fan-operations-help.component.html',
    styleUrls: ['./fan-operations-help.component.css'],
    standalone: false
})
export class FanOperationsHelpComponent implements OnInit {
  private featureFlagService = inject(FeatureFlagService);
  showOperationalImpacts: Signal<boolean> = this.featureFlagService.showOperationalImpacts;

  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
