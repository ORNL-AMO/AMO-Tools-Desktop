import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-o2-enrichment-help',
  templateUrl: './o2-enrichment-help.component.html',
  styleUrls: ['./o2-enrichment-help.component.css']
})
export class O2EnrichmentHelpComponent implements OnInit {
  @Input()
  currentField: string;
  
  constructor() { }

  ngOnInit() {
  }

}
