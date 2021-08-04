import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-stack-loss-help',
  templateUrl: './stack-loss-help.component.html',
  styleUrls: ['./stack-loss-help.component.css']
})
export class StackLossHelpComponent implements OnInit {
  @Input()
  currentField: string;
  displaySuggestions: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  toggleSuggestions() {
    this.displaySuggestions = !this.displaySuggestions;
  }
}
