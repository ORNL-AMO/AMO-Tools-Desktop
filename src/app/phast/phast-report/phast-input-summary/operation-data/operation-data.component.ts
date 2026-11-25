import { Component, OnInit, Input, ViewChild, ElementRef, inject, Signal } from '@angular/core';
import { FeatureFlagService } from '../../../../shared/feature-flag.service';
import { Modification, PHAST } from "../../../../shared/models/phast/phast";
import { Settings } from '../../../../shared/models/settings';
import { EnergySourceFields } from '../../../../process-heating-assessment/models/modification';

@Component({
    selector: 'app-operation-data',
    templateUrl: './operation-data.component.html',
    styleUrls: ['./operation-data.component.css'],
    standalone: false
})
export class OperationDataComponent implements OnInit {
  private featureFlagService = inject(FeatureFlagService);
  showOperationalImpacts: Signal<boolean> = this.featureFlagService.showOperationalImpacts;

  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;
  collapse: boolean = true;
  
  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any;

  constructor() { }

  ngOnInit() {

  }
  /**
   * @param modification the modification column
   * @returns its own energy source, set when a Process Heating modification switched it, else the assessment's
   */
  scenarioEnergySource(modification: Modification): EnergySourceFields {
    return modification.energySource ?? this.settings;
  }

  get hasCustomFurnaceName(): boolean {
    return !!this.settings.customFurnaceName || (this.phast.modifications ?? []).some(modification => modification.energySource?.customFurnaceName);
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }
  
  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }
  
}
