import { Component, OnInit, Input } from '@angular/core';
declare var converter: any;
@Component({
  selector: 'app-head-tool-form',
  templateUrl: './head-tool-form.component.html',
  styleUrls: ['./head-tool-form.component.css']
})
export class HeadToolFormComponent implements OnInit {
  @Input()
  headToolForm: any;
  constructor() { }

  ngOnInit() {

    let test = converter(1).from('l').to('ml');
    console.log(test);
  }

}
