import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReduceRunTimeComponent } from './reduce-run-time.component';

describe('ReduceRunTimeComponent', () => {
  let component: ReduceRunTimeComponent;
  let fixture: ComponentFixture<ReduceRunTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReduceRunTimeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReduceRunTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
