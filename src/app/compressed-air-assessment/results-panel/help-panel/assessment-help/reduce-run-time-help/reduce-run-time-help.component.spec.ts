import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReduceRunTimeHelpComponent } from './reduce-run-time-help.component';

describe('ReduceRunTimeHelpComponent', () => {
  let component: ReduceRunTimeHelpComponent;
  let fixture: ComponentFixture<ReduceRunTimeHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReduceRunTimeHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReduceRunTimeHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
