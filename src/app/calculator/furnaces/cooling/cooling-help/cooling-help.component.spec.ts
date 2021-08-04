import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoolingHelpComponent } from './cooling-help.component';

describe('CoolingHelpComponent', () => {
  let component: CoolingHelpComponent;
  let fixture: ComponentFixture<CoolingHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoolingHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoolingHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
