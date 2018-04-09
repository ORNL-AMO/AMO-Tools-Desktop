import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { PSAT } from '../../shared/models/psat';
import { Modification } from '../../shared/models/psat';

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
  newModificationName: string;
  currentTab: string;
  // tabSubscription: Subscription;
  constructor() { }

  ngOnInit() {
    if (this.modifications) {
      this.newModificationName = 'Scenario ' + (this.modifications.length + 1);
    } else {
      this.newModificationName = 'Scenario 1';
    }
    // this.tabSubscription = this.phastService.assessmentTab.subscribe(val => {
    //   this.currentTab = val;
    // })
  }
  
  ngOnDestroy() {
    //this.tabSubscription.unsubscribe();
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
    this.save.emit(tmpModification)
  }
}
