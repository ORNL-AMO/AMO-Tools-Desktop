import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemBasicsComponent } from './system-basics.component';

describe('SystemBasicsComponent', () => {
  let component: SystemBasicsComponent;
  let fixture: ComponentFixture<SystemBasicsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemBasicsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SystemBasicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
