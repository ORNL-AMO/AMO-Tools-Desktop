import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FsatService } from '../fsat.service';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { FSAT } from '../../shared/models/fans';

@Component({
  selector: 'app-fsat-calculators',
  templateUrl: './fsat-calculators.component.html',
  styleUrls: ['./fsat-calculators.component.css'],
  standalone: false
})
export class FsatCalculatorsComponent implements OnInit, OnDestroy {
  fsat: FSAT;
  assessment: Assessment;
  settings: Settings;
  calcTab: string;
  containerHeight: number;

  private subs: Subscription[] = [];

  constructor(private fsatService: FsatService) { }

  ngOnInit() {
    this.subs.push(this.fsatService.fsat.subscribe(val => this.fsat = val));
    this.subs.push(this.fsatService.assessment.subscribe(val => this.assessment = val));
    this.subs.push(this.fsatService.settings.subscribe(val => this.settings = val));
    this.subs.push(this.fsatService.calculatorTab.subscribe(val => this.calcTab = val));
    this.subs.push(this.fsatService.containerHeight.subscribe(val => this.containerHeight = val));
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
