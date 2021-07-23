import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentrifugalSpecificsHelpComponent } from './centrifugal-specifics-help.component';

describe('CentrifugalSpecificsHelpComponent', () => {
  let component: CentrifugalSpecificsHelpComponent;
  let fixture: ComponentFixture<CentrifugalSpecificsHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CentrifugalSpecificsHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CentrifugalSpecificsHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
