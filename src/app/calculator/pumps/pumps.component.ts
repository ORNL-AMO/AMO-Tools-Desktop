import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';

@Component({
  selector: 'app-pumps',
  templateUrl: './pumps.component.html',
  styleUrls: ['./pumps.component.css']
})
export class PumpsComponent implements OnInit {
  headTool: boolean = false;
  constructor() { }

  ngOnInit() {
  }

  showTool() {
    this.headTool = true;
  }

  hideTool(){
    this.headTool = false;
  }

  @ViewChild('headToolModal') public headToolModal: ModalDirective;
  showHeadToolModal() {
    this.headToolModal.show();
  }

  hideHeadToolModal() {
    this.headToolModal.hide();
  }

}
