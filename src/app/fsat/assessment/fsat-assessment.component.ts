import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FsatService } from '../fsat.service';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { FSAT } from '../../shared/models/fans';

@Component({
  selector: 'app-fsat-assessment',
  templateUrl: './fsat-assessment.component.html',
  styleUrls: ['./fsat-assessment.component.css'],
  standalone: false
})
export class FsatAssessmentComponent implements OnInit, OnDestroy {
  fsat: FSAT;
  assessment: Assessment;
  settings: Settings;
  assessmentTab: string;
  containerHeight: number;
  modificationIndex: number;
  modificationExists: boolean;
  modificationModalOpen: boolean;

  private subs: Subscription[] = [];

  constructor(private fsatService: FsatService) { }

  ngOnInit() {
    this.subs.push(this.fsatService.fsat.subscribe(val => this.fsat = val));
    this.subs.push(this.fsatService.assessment.subscribe(val => this.assessment = val));
    this.subs.push(this.fsatService.settings.subscribe(val => this.settings = val));
    this.subs.push(this.fsatService.assessmentTab.subscribe(val => this.assessmentTab = val));
    this.subs.push(this.fsatService.containerHeight.subscribe(val => this.containerHeight = val));
    this.subs.push(this.fsatService.modificationIndex.subscribe(val => this.modificationIndex = val));
    this.subs.push(this.fsatService.modificationExists.subscribe(val => this.modificationExists = val));
    this.subs.push(this.fsatService.openModificationModal.subscribe(val => this.modificationModalOpen = val));
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  saveFsat(newFsat: FSAT) {
    this.fsatService.setFsat(newFsat);
  }

  addNewMod() {
    this.fsatService.addNewModRequested.next({ exploreOpportunities: this.assessmentTab === 'explore-opportunities' });
  }
}
