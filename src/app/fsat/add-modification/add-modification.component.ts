import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { Modification, FSAT } from '../../shared/models/fans';
import { FsatService } from '../fsat.service';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-add-modification',
  templateUrl: './add-modification.component.html',
  styleUrls: ['./add-modification.component.css']
})
export class AddModificationComponent implements OnInit {
  @Input()
  fsat: FSAT;
  @Input()
  modifications: Array<Modification>;
  @Output('save')
  save = new EventEmitter<Modification>();
  @Input()
  modificationExists: boolean;
  @Input()
  settings: Settings;

  isWhatIfScenario: boolean = true;

  newModificationName: string;
  assessmentTab: string;
  assessmentTabSub: Subscription;
  constructor(private fsatService: FsatService) { }

  ngOnInit() {
    if (this.modifications) {
      this.newModificationName = 'Scenario ' + (this.modifications.length + 1);
    } else {
      this.newModificationName = 'Scenario 1';
    }
    // this.tabSubscription = this.psatService.secondaryTab.subscribe(val => {
    //   this.currentTab = val;
    // })
    
    this.assessmentTabSub = this.fsatService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
    });
  }

  ngOnDestroy() {
    this.assessmentTabSub.unsubscribe();
  }

  addModification() {
    let tmpModification: Modification = this.fsatService.getNewMod(this.fsat, this.settings);
    tmpModification.fsat.name = this.newModificationName;
    tmpModification.fsat.whatIfScenario = this.isWhatIfScenario;
    tmpModification.exploreOpportunities = (this.assessmentTab == 'explore-opportunities');
    this.save.emit(tmpModification);
  }

  saveScenarioChange(isNewModWhatIfScenario: boolean){
    this.isWhatIfScenario = isNewModWhatIfScenario;
  }

}
