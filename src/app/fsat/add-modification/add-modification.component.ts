import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { Modification, FSAT } from '../../shared/models/fans';
import { FsatService } from '../fsat.service';

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
    })
  }

  ngOnDestroy(){
    this.assessmentTabSub.unsubscribe();
  }

  addModification() {
    let tmpModification: Modification = {
      fsat: {
        name: this.newModificationName,
        notes: {
          fieldDataNotes: '',
          fanMotorNotes: '',
          fanSetupNotes: '',
          fluidNotes: ''
        }
      },
      exploreOpportunities: (this.assessmentTab == 'explore-opportunities')
    }
    let fsatCopy: FSAT = (JSON.parse(JSON.stringify(this.fsat)));
    tmpModification.fsat.baseGasDensity = fsatCopy.baseGasDensity;
    tmpModification.fsat.fanMotor = fsatCopy.fanMotor;
    tmpModification.fsat.fanSetup = fsatCopy.fanSetup;
    tmpModification.fsat.fieldData = fsatCopy.fieldData;
    this.save.emit(tmpModification)
  }
}
