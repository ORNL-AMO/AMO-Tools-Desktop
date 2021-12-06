import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullLoadAmpsFormComponent } from './full-load-amps-form.component';

describe('FullLoadAmpsFormComponent', () => {
  let component: FullLoadAmpsFormComponent;
  let fixture: ComponentFixture<FullLoadAmpsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FullLoadAmpsFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FullLoadAmpsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
