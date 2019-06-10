import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StackLossByVolumeComponent } from './stack-loss-by-volume.component';

describe('StackLossByVolumeComponent', () => {
  let component: StackLossByVolumeComponent;
  let fixture: ComponentFixture<StackLossByVolumeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StackLossByVolumeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StackLossByVolumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
