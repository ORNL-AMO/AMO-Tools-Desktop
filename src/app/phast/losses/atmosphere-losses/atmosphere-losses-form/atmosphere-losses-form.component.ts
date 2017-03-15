import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-atmosphere-losses-form',
  templateUrl: './atmosphere-losses-form.component.html',
  styleUrls: ['./atmosphere-losses-form.component.css']
})
export class AtmosphereLossesFormComponent implements OnInit {
  @Input()
  atmosphereLossForm: any;
  constructor() { }

  ngOnInit() {
  }

}
