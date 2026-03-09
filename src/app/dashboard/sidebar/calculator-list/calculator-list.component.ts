import { Component, inject, OnInit, Signal } from '@angular/core';
import { FeatureFlagService } from '../../../shared/feature-flag.service';

@Component({
    selector: 'app-calculator-list',
    templateUrl: './calculator-list.component.html',
    styleUrls: ['./calculator-list.component.css'],
    standalone: false
})
export class CalculatorListComponent implements OnInit {
  private featureFlagService = inject(FeatureFlagService);
  showOperationalImpacts: Signal<boolean> = this.featureFlagService.showOperationalImpacts;
  
  ngOnInit() {}
}
