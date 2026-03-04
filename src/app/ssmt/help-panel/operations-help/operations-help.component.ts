import { Component, OnInit, Input, inject, Signal } from '@angular/core';
import { FeatureFlagService } from '../../../shared/feature-flag.service';

@Component({
    selector: 'app-operations-help',
    templateUrl: './operations-help.component.html',
    styleUrls: ['./operations-help.component.css'],
    standalone: false
})
export class OperationsHelpComponent implements OnInit {
  private featureFlagService = inject(FeatureFlagService);
  showOperationalImpacts: Signal<boolean> = this.featureFlagService.showOperationalImpacts;

  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
