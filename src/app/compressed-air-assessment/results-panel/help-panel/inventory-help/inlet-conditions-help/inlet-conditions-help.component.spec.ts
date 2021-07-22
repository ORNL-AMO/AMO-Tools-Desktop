import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InletConditionsHelpComponent } from './inlet-conditions-help.component';

describe('InletConditionsHelpComponent', () => {
  let component: InletConditionsHelpComponent;
  let fixture: ComponentFixture<InletConditionsHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InletConditionsHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InletConditionsHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
