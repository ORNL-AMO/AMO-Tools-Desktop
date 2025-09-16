import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-animated-checkmark',
    templateUrl: './animated-checkmark.component.html',
    styleUrls: ['./animated-checkmark.component.css'],
    standalone: false
})
export class AnimatedCheckmarkComponent implements OnInit {
  @Input()
  active: boolean;

  constructor() { }

  ngOnInit() {
  }

}
