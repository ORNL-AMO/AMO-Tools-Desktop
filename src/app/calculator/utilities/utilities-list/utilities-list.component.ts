import { Component, inject, OnInit, Signal } from '@angular/core';
import { FeatureFlagService } from '../../../shared/feature-flag.service';

@Component({
    selector: 'app-utilities-list',
    templateUrl: './utilities-list.component.html',
    styleUrls: ['./utilities-list.component.css'],
    standalone: false
})
export class UtilitiesListComponent implements OnInit {
  private featureFlagService = inject(FeatureFlagService);
  showOperationalImpacts: Signal<boolean> = this.featureFlagService.showOperationalImpacts;

  ngOnInit() {
  }

}
