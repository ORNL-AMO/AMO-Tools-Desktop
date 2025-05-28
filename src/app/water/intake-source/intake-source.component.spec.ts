import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntakeSourceComponent } from './intake-source.component';

describe('IntakeSourceComponent', () => {
  let component: IntakeSourceComponent;
  let fixture: ComponentFixture<IntakeSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntakeSourceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IntakeSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
