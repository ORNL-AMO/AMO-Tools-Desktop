import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-other-losses-form',
  templateUrl: './other-losses-form.component.html',
  styleUrls: ['./other-losses-form.component.css']
})
export class OtherLossesFormComponent implements OnInit {
  @Input()
  otherLossesForm: any;
  constructor() { }

  ngOnInit() {
  }

}
