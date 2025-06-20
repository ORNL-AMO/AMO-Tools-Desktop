import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessCoolingComponent } from './process-cooling.component';

describe('ProcessCoolingComponent', () => {
  let component: ProcessCoolingComponent;
  let fixture: ComponentFixture<ProcessCoolingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessCoolingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessCoolingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
