import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-system-basics',
  templateUrl: './system-basics.component.html',
  styleUrls: ['./system-basics.component.css']
})
export class SystemBasicsComponent implements OnInit {
  @Output('continue')
  continue = new EventEmitter<string>();

  constructor(private router: Router) { }

  ngOnInit() {
  }

  saveContinue(){
    //TODO: Save Logic

    this.continue.emit('pump-fluid');
  }

  close(){
    this.router.navigateByUrl('/dashboard');
  }
}
