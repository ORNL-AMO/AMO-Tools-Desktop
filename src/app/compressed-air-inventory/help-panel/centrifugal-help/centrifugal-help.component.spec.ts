import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentrifugalHelpComponent } from './centrifugal-help.component';

describe('CentrifugalHelpComponent', () => {
  let component: CentrifugalHelpComponent;
  let fixture: ComponentFixture<CentrifugalHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CentrifugalHelpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CentrifugalHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
