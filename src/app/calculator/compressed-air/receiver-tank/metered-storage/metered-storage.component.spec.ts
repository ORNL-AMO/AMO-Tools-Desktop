import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeteredStorageComponent } from './metered-storage.component';

describe('MeteredStorageComponent', () => {
  let component: MeteredStorageComponent;
  let fixture: ComponentFixture<MeteredStorageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeteredStorageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeteredStorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
