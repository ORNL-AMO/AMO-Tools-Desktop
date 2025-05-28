import { Component, OnInit, Input } from '@angular/core';
import { LightingFixtureData, LightingFixtureCategories } from '../../lighting-fixture-data/lighting-data';
import { LightingReplacementService } from '../lighting-replacement.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-lighting-replacement-help',
    templateUrl: './lighting-replacement-help.component.html',
    styleUrls: ['./lighting-replacement-help.component.css'],
    standalone: false
})
export class LightingReplacementHelpComponent implements OnInit {
  @Input()
  currentField: string;

  lightingFixtureCategories: Array<{ category: number, label: string, fixturesData: Array<LightingFixtureData> }>;
  selectedFixtureTypesSub: Subscription;
  fixtureTypes: Array<LightingFixtureData>;
  constructor(private lightingReplacementService: LightingReplacementService) { 
    this.lightingFixtureCategories = LightingFixtureCategories;
  }

  ngOnInit() {
    this.selectedFixtureTypesSub = this.lightingReplacementService.selectedFixtureTypes.subscribe(fixtureTypes => {
      this.fixtureTypes = fixtureTypes;
    })
  }

  ngOnDestroy(){
    this.selectedFixtureTypesSub.unsubscribe();
  }

}
