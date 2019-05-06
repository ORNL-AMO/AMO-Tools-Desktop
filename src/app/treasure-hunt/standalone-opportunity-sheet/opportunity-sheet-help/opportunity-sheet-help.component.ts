import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-opportunity-sheet-help',
  templateUrl: './opportunity-sheet-help.component.html',
  styleUrls: ['./opportunity-sheet-help.component.css']
})
export class OpportunitySheetHelpComponent implements OnInit {
  @Input()
  currentField: string;
  
  constructor() { }

  ngOnInit() {
  }

}
