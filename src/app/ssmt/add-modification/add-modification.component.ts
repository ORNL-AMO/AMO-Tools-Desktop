import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { SSMT, Modification } from '../../shared/models/steam/ssmt';
import { SsmtService } from '../ssmt.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-add-modification',
    templateUrl: './add-modification.component.html',
    styleUrls: ['./add-modification.component.css'],
    standalone: false
})
export class AddModificationComponent implements OnInit {
  @Input()
  ssmt: SSMT;
  @Input()
  modifications: Array<Modification>;
  @Output('save')
  save = new EventEmitter<Modification>();
  @Input()
  modificationExists: boolean;

  newModificationName: string;
  assessmentTab: string;
  assessmentTabSub: Subscription;
  constructor(private ssmtService: SsmtService) { }

  ngOnInit() {
    if (this.modifications) {
      this.newModificationName = 'Scenario ' + (this.modifications.length + 1);
    } else {
      this.newModificationName = 'Scenario 1';
    }
    this.assessmentTabSub = this.ssmtService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
    });
  }

  ngOnDestroy() {
    this.assessmentTabSub.unsubscribe();
  }

  addModification() {
    let ssmtCopy: SSMT = (JSON.parse(JSON.stringify(this.ssmt)));
    delete ssmtCopy.modifications;
    let modification: Modification = {
      ssmt: ssmtCopy,
      exploreOpportunities: (this.assessmentTab === 'explore-opportunities')
    };
    modification.ssmt.co2SavingsData.userEnteredModificationEmissions = modification.ssmt.co2SavingsData.userEnteredBaselineEmissions;
    modification.ssmt.name = this.newModificationName;
    if (modification.ssmt.headerInput.lowPressureHeader) {
      modification.ssmt.headerInput.lowPressureHeader.useBaselineProcessSteamUsage = true;
    }
    if (modification.ssmt.headerInput.mediumPressureHeader) {
      modification.ssmt.headerInput.mediumPressureHeader.useBaselineProcessSteamUsage = true;
    }
    this.save.emit(modification);
  }
}
