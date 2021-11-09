import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustSequencerProfileComponent } from './adjust-sequencer-profile.component';

describe('AdjustSequencerProfileComponent', () => {
  let component: AdjustSequencerProfileComponent;
  let fixture: ComponentFixture<AdjustSequencerProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdjustSequencerProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustSequencerProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
