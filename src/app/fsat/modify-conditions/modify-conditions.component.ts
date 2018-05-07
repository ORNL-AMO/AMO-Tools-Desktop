import { Component, OnInit, Input } from '@angular/core';
import { ModifyConditionsService } from './modify-conditions.service';
import { Subscription } from 'rxjs';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { FsatService } from '../fsat.service';

@Component({
  selector: 'app-modify-conditions',
  templateUrl: './modify-conditions.component.html',
  styleUrls: ['./modify-conditions.component.css']
})
export class ModifyConditionsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;
  @Input()
  modificationIndex: number;
  @Input()
  modificationExists: boolean;

  modifyConditionsTab: string;
  modifyConditionsTabSub: Subscription;
  baselineSelected: boolean = false;
  modifiedSelected: boolean = true;

  constructor(private modifyConditionsService: ModifyConditionsService, private fsatService: FsatService) { }

  ngOnInit() {
    console.log(this.assessment.fsat);
    this.modifyConditionsTabSub = this.modifyConditionsService.modifyConditionsTab.subscribe(val => {
      this.modifyConditionsTab = val;
    })
  }

  ngOnChanges(){
    console.log(this.modificationIndex);
  }

  ngOnDestroy(){
    this.modifyConditionsTabSub.unsubscribe();
  }
  
  togglePanel(bool: boolean) {
    if (bool == this.baselineSelected) {
      this.baselineSelected = true;
      this.modifiedSelected = false;
    }
    else if (bool == this.modifiedSelected) {
      this.modifiedSelected = true;
      this.baselineSelected = false;
    }
  }

  addModification() {
    this.fsatService.openNewModal.next(true);
  }
}
