import { Component, OnInit, Input } from '@angular/core';
import { LightingFixtureData, LightingFixtureCategory } from '../../../../tools-suite-api/lighting-suite-api.service';
import { LightingReplacementService } from '../lighting-replacement.service';
import { Subscription } from 'rxjs';
import { LightingSuiteApiService } from '../../../../tools-suite-api/lighting-suite-api.service';
@Component({
    selector: 'app-lighting-replacement-help',
    templateUrl: './lighting-replacement-help.component.html',
    styleUrls: ['./lighting-replacement-help.component.css'],
    standalone: false
})
export class LightingReplacementHelpComponent implements OnInit {
  @Input()
  currentField: string;

  lightingFixtureCategories: Array<LightingFixtureCategory>;
  selectedFixtureTypesSub: Subscription;
  fixtureTypes: Array<LightingFixtureData>;
  constructor(private lightingReplacementService: LightingReplacementService, private lightingSuiteApiService: LightingSuiteApiService) { }

  ngOnInit() {
    this.lightingFixtureCategories = this.lightingSuiteApiService.lightingFixtureCategories;
    this.selectedFixtureTypesSub = this.lightingReplacementService.selectedFixtureTypes.subscribe(fixtureTypes => {
      this.fixtureTypes = fixtureTypes;
    })
  }

  ngOnDestroy(){
    this.selectedFixtureTypesSub.unsubscribe();
  }

}
