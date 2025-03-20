import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { O2EnrichmentService } from '../o2-enrichment.service';
import { EnrichmentOutput } from '../../../../shared/models/phast/o2Enrichment';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-o2-enrichment-results',
    templateUrl: './o2-enrichment-results.component.html',
    styleUrls: ['./o2-enrichment-results.component.css'],
    standalone: false
})
export class O2EnrichmentResultsComponent implements OnInit {

  @Input()
  settings: Settings;

  outputs: Array<EnrichmentOutput>;
  currentEnrichmentOutput: EnrichmentOutput;
  outputSub: Subscription;
  selectedRow: number = 0;
  currentEnrichmentIndexSub: Subscription;
  constructor(private o2EnrichmentService: O2EnrichmentService) { }

  ngOnInit(): void {
    this.outputSub = this.o2EnrichmentService.enrichmentOutputs.subscribe(outputs => {
      let currentEnrichmentIndex = this.o2EnrichmentService.currentEnrichmentIndex.getValue();
      this.outputs = outputs;
      this.currentEnrichmentOutput = outputs[currentEnrichmentIndex];
    });

    this.currentEnrichmentIndexSub = this.o2EnrichmentService.currentEnrichmentIndex.subscribe(index => {
      this.selectedRow = index;
    });
  }

  ngOnDestroy() {
    this.outputSub.unsubscribe();
    this.currentEnrichmentIndexSub.unsubscribe();
  }

  editEnrichment(index: number) {
    this.o2EnrichmentService.currentEnrichmentIndex.next(index);
    this.selectedRow = index;
  }
}
