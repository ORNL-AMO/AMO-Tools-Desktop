import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddReceiverVolumeHelpComponent } from './add-receiver-volume-help.component';

describe('AddReceiverVolumeHelpComponent', () => {
  let component: AddReceiverVolumeHelpComponent;
  let fixture: ComponentFixture<AddReceiverVolumeHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddReceiverVolumeHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddReceiverVolumeHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
