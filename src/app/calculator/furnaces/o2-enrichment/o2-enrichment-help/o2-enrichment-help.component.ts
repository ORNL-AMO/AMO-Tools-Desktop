import { Component, OnInit, Input } from '@angular/core';
import { O2EnrichmentService } from '../o2-enrichment.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-o2-enrichment-help',
    templateUrl: './o2-enrichment-help.component.html',
    styleUrls: ['./o2-enrichment-help.component.css'],
    standalone: false
})
export class O2EnrichmentHelpComponent implements OnInit {
  currentField: string;
  currentFieldSub: Subscription;
  
  constructor(private o2EnrichmentService: O2EnrichmentService) { }

  ngOnInit(): void {
    this.currentFieldSub = this.o2EnrichmentService.currentField.subscribe(val => {
      this.currentField = val;
    });
  }

  ngOnDestroy(): void {
    this.currentFieldSub.unsubscribe();
  }


}
