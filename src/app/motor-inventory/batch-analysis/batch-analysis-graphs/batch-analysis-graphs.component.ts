import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-batch-analysis-graphs',
    templateUrl: './batch-analysis-graphs.component.html',
    styleUrls: ['./batch-analysis-graphs.component.css'],
    standalone: false
})
export class BatchAnalysisGraphsComponent implements OnInit {

 
  constructor() { }

  ngOnInit(): void {
  }


  ngAfterViewInit(){
    //fires after child components are rendered
    //call resize: reactive plotly plots as child components will resize to correct dimensions
    window.dispatchEvent(new Event('resize'));
  }

}
