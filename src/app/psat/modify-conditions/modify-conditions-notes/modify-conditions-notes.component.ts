import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Notes } from '../../../shared/models/psat';
import { Subscription } from 'rxjs';
import { PsatTabService } from '../../psat-tab.service';
@Component({
    selector: 'app-modify-conditions-notes',
    templateUrl: './modify-conditions-notes.component.html',
    styleUrls: ['./modify-conditions-notes.component.css'],
    standalone: false
})
export class ModifyConditionsNotesComponent implements OnInit {
  @Input()
  notes: Notes;
  @Input()
  currentTab: string;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  tabSub: Subscription;
  constructor(private psatTabService: PsatTabService) { }

  ngOnInit() {
    this.tabSub = this.psatTabService.modifyConditionsTab.subscribe(val => {
      this.currentTab = val;
    })
  }
  ngOnDestroy() {
    this.tabSub.unsubscribe();
  }

  save() {
    this.emitSave.emit(true);
  }
}
