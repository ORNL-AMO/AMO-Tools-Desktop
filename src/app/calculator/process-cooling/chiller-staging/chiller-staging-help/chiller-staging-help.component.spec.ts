import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChillerStagingHelpComponent } from './chiller-staging-help.component';

describe('ChillerStagingHelpComponent', () => {
  let component: ChillerStagingHelpComponent;
  let fixture: ComponentFixture<ChillerStagingHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChillerStagingHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChillerStagingHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
