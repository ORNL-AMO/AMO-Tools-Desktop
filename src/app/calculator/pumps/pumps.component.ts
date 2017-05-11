import { Component, OnInit, Input } from '@angular/core';


@Component({
  selector: 'app-pumps',
  templateUrl: './pumps.component.html',
  styleUrls: ['./pumps.component.css']
})
export class PumpsComponent implements OnInit {
  @Input()
  selectedTool: string;
  constructor() { }

  ngOnInit() {
    if(!this.selectedTool){
      this.selectedTool = 'none';
    }
  }

  showTool(str: string) {
    this.selectedTool = str;
  }

  hideTool() {
    this.selectedTool = 'none'
  }

}
