import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatCascadingHelpComponent } from './heat-cascading-help.component';

describe('HeatCascadingHelpComponent', () => {
  let component: HeatCascadingHelpComponent;
  let fixture: ComponentFixture<HeatCascadingHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeatCascadingHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatCascadingHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
