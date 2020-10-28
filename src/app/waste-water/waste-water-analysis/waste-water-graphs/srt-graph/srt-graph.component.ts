import { Component, Input, OnInit } from '@angular/core';
import { AnalysisGraphItem } from '../../waste-water-analysis.service';

@Component({
  selector: 'app-srt-graph',
  templateUrl: './srt-graph.component.html',
  styleUrls: ['./srt-graph.component.css']
})
export class SrtGraphComponent implements OnInit {
  @Input()
  analysisGraphItem: AnalysisGraphItem;

  constructor() { }

  ngOnInit(): void {
  }

}
