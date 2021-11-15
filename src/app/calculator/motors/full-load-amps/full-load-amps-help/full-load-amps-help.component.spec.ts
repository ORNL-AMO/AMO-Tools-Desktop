import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullLoadAmpsHelpComponent } from './full-load-amps-help.component';

describe('FullLoadAmpsHelpComponent', () => {
  let component: FullLoadAmpsHelpComponent;
  let fixture: ComponentFixture<FullLoadAmpsHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FullLoadAmpsHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FullLoadAmpsHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
