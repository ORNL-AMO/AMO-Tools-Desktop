import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { SSMT, Modification } from '../../shared/models/steam/ssmt';
import { SsmtService } from '../ssmt.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-modification',
  templateUrl: './add-modification.component.html',
  styleUrls: ['./add-modification.component.css']
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
    // this.tabSubscription = this.psatService.secondaryTab.subscribe(val => {
    //   this.currentTab = val;
    // })

    this.assessmentTabSub = this.ssmtService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
    })
  }

  ngOnDestroy(){
    this.assessmentTabSub.unsubscribe();
  }

  addModification() {
    let ssmtCopy: SSMT = (JSON.parse(JSON.stringify(this.ssmt)));
    let tmpModification: Modification = {
      ssmt: ssmtCopy,
      exploreOpportunities: (this.assessmentTab == 'explore-opportunities')
    }
    tmpModification.ssmt.name = this.newModificationName;
    this.save.emit(tmpModification)
  }
}
