import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddReceiverVolumeComponent } from './add-receiver-volume.component';

describe('AddReceiverVolumeComponent', () => {
  let component: AddReceiverVolumeComponent;
  let fixture: ComponentFixture<AddReceiverVolumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddReceiverVolumeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddReceiverVolumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
