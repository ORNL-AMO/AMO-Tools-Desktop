import { Component, OnInit, Input } from '@angular/core';
import { TreasureHuntResults } from '../../../shared/models/treasure-hunt';

@Component({
  selector: 'app-report-graphs',
  templateUrl: './report-graphs.component.html',
  styleUrls: ['./report-graphs.component.css']
})
export class ReportGraphsComponent implements OnInit {
  @Input()
  treasureHuntResults: TreasureHuntResults;

  constructor() { }

  ngOnInit() {
  }

}
