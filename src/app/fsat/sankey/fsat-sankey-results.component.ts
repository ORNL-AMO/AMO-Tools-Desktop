import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FsatService } from '../fsat.service';
import { Settings } from '../../shared/models/settings';
import { FSAT } from '../../shared/models/fans';

@Component({
  selector: 'app-fsat-sankey-results',
  templateUrl: './fsat-sankey-results.component.html',
  styleUrls: ['./fsat-sankey-results.component.css'],
  standalone: false
})
export class FsatSankeyResultsComponent implements OnInit, OnDestroy {
  settings: Settings;
  containerHeight: number;
  sankeyLabelStyle: string;
  showSankeyLabelOptions: boolean;
  fsatOptions: Array<{ name: string, fsat: FSAT }>;
  selectedSankeyFsatOption: { fsat: FSAT, name: string };

  private subs: Subscription[] = [];

  constructor(private fsatService: FsatService) { }

  ngOnInit() {
    this.subs.push(this.fsatService.settings.subscribe(val => this.settings = val));
    this.subs.push(this.fsatService.containerHeight.subscribe(val => this.containerHeight = val));
    this.subs.push(this.fsatService.sankeyOptions.subscribe(val => this.fsatOptions = val));
    this.subs.push(this.fsatService.selectedSankeyFsatOption.subscribe(val => this.selectedSankeyFsatOption = val));
    this.subs.push(this.fsatService.sankeyLabelStyle.subscribe(val => this.sankeyLabelStyle = val));
    this.subs.push(this.fsatService.showSankeyLabelOptions.subscribe(val => this.showSankeyLabelOptions = val));
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  selectSankeyOption(option: { fsat: FSAT, name: string }) {
    this.fsatService.setSelectedSankeyFsatOption(option);
  }

  setSankeyLabelStyle(style: string) {
    this.fsatService.setSankeyLabelStyle(style);
  }
}
