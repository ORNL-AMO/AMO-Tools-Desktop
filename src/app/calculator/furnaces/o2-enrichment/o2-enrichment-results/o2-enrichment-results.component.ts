import { Component, OnInit, Input } from '@angular/core';
import { O2EnrichmentService } from '../o2-enrichment.service';
import { O2EnrichmentOutput } from '../../../../shared/models/phast/o2Enrichment';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-o2-enrichment-results',
  templateUrl: './o2-enrichment-results.component.html',
  styleUrls: ['./o2-enrichment-results.component.css']
})
export class O2EnrichmentResultsComponent implements OnInit {

  @Input()
  settings: Settings;
  
  outputs: Array<O2EnrichmentOutput>;
  currentEnrichmentOutput: O2EnrichmentOutput;
  outputSub: Subscription;
  // isBaseline: boolean;
  // selectedRow: number;
  constructor(private o2EnrichmentService: O2EnrichmentService) { }

  ngOnInit(): void {
    this.outputSub = this.o2EnrichmentService.enrichmentOutputs.subscribe(outputs => {
      let currentEnrichmentIndex = this.o2EnrichmentService.currentEnrichmentIndex.getValue();
      if (currentEnrichmentIndex == 0) {
        // this.isBaseline = true;
      }
      this.outputs = outputs;
      this.currentEnrichmentOutput = outputs[currentEnrichmentIndex];
    });
  }

  ngOnDestroy() {
    this.outputSub.unsubscribe();
  }

  editEnrichment(index: number) {
    this.o2EnrichmentService.currentEnrichmentIndex.next(index);
    // if (index != 0) {
    //   this.selectedRow = index;
    // } else {
    //   this.selectedRow = undefined;
    // }
  }

  // getRowColor(index: number) {
  //   if (index == 0) {
  //     return '#ffdccc';
  //   } else if(this.selectedRow == index) {
  //     return 'lightgrey';
  //   }
  //   return '';
  // }

}
