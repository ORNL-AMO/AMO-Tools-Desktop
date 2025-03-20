import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { SteamReductionResults } from '../../../../shared/models/standalone';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';

@Component({
    selector: 'app-steam-reduction-results',
    templateUrl: './steam-reduction-results.component.html',
    styleUrls: ['./steam-reduction-results.component.css'],
    standalone: false
})
export class SteamReductionResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  results: SteamReductionResults;
  @Input()
  modificationExists: boolean;

  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: any;

  energyResultUnit = 'MMBtu';


  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.results) {
      if (this.settings.unitsOfMeasure == 'Metric') {
        this.energyResultUnit = 'GJ';
        if (Math.abs(this.results.baselineResults.energyUse) < 0.001) {
          this.energyResultUnit = 'MJ';
          this.results.baselineResults.energyUse = this.results.baselineResults.energyUse * 1000;
          if (this.modificationExists) {
            this.results.modificationResults.energyUse = this.results.modificationResults.energyUse * 1000;
          }
        }
      }
      // else if (this.settings.unitsOfMeasure == 'Imperial') {
      //   this.energyResultUnit = 'MMBtu';
      // }
    }
  }

  updateTable0String() {
    this.table0String = this.copyTable0.nativeElement.innerText;
  }

}
