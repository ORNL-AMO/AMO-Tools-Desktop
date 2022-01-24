import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { PSAT, PsatOutputs } from '../../shared/models/psat';
import { Modification } from '../../shared/models/psat';
import { Subscription } from 'rxjs';
import { PsatTabService } from '../psat-tab.service';
import { PsatService } from '../psat.service';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-add-modification',
  templateUrl: './add-modification.component.html',
  styleUrls: ['./add-modification.component.css']
})
export class AddModificationComponent implements OnInit {
  @Input()
  psat: PSAT;
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
  currentTab: string;
  tabSubscription: Subscription;
  constructor(private psatTabService: PsatTabService, private psatService: PsatService) { }

  ngOnInit() {
    if (this.modifications) {
      this.newModificationName = 'Scenario ' + (this.modifications.length + 1);
    } else {
      this.newModificationName = 'Scenario 1';
    }
    this.tabSubscription = this.psatTabService.secondaryTab.subscribe(val => {
      this.currentTab = val;
    })

  }

  ngOnDestroy() {
    this.tabSubscription.unsubscribe();
  }

  addModification() {
    let tmpModification: Modification = {
      psat: {
        name: this.newModificationName,
      },
      notes: {
        fieldDataNotes: '',
        motorNotes: '',
        pumpFluidNotes: '',
        systemBasicsNotes: ''
      },
    }
    tmpModification.psat.inputs = (JSON.parse(JSON.stringify(this.psat.inputs)));
    tmpModification.psat.inputs.pump_style = 11;
    tmpModification.psat.inputs.whatIfScenario = this.isWhatIfScenario;
    tmpModification.exploreOpportunities = (this.currentTab == 'explore-opportunities');
    let baselineResults: PsatOutputs = this.psatService.resultsExisting(this.psat.inputs, this.settings);
    tmpModification.psat.inputs.pump_specified = baselineResults.pump_efficiency;
    this.save.emit(tmpModification)
  }

  saveScenarioChange(isNewModWhatIfScenario: boolean){
    this.isWhatIfScenario = isNewModWhatIfScenario;
  }

}
