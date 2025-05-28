import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-alert-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-badge.component.html',
  styleUrl: './alert-badge.component.css'
})
export class AlertBadgeComponent {
  @Input()
  alertText: string;
  @Input()
  style: { [klass: string]: any };
  
  ngOnInit() {
  }
}
