import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-pumps',
  templateUrl: './pumps.component.html',
  styleUrls: ['./pumps.component.css']
})
export class PumpsComponent implements OnInit {
  selectedTool: string = 'none';
  constructor() { }

  ngOnInit() {
  }

  showTool(str: string) {
    this.selectedTool = str;
  }

  hideTool() {
    this.selectedTool = 'none'
  }

}
