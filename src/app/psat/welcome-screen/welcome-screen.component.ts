import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-welcome-screen',
  templateUrl: './welcome-screen.component.html',
  styleUrls: ['./welcome-screen.component.css']
})
export class WelcomeScreenComponent implements OnInit {
  @Output('emitClose')
  emitClose: EventEmitter<boolean> = new EventEmitter<boolean>(false);

  constructor() { }

  ngOnInit(): void {
  }


  closePopUp(){
    this.emitClose.emit(true);
  }
}
