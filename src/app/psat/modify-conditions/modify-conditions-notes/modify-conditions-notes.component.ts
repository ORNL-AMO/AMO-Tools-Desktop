import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Notes } from '../../../shared/models/psat';
import { PsatService } from '../../psat.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-modify-conditions-notes',
  templateUrl: './modify-conditions-notes.component.html',
  styleUrls: ['./modify-conditions-notes.component.css']
})
export class ModifyConditionsNotesComponent implements OnInit {
  @Input()
  notes: Notes;
  @Input()
  currentTab: string;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  tabSub: Subscription;
  constructor(private psatService: PsatService) { }

  ngOnInit() {
    this.tabSub = this.psatService.modifyConditionsTab.subscribe(val => {
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
