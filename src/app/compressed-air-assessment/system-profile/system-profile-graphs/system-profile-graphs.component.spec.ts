import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemProfileGraphsComponent } from './system-profile-graphs.component';

describe('SystemProfileGraphsComponent', () => {
  let component: SystemProfileGraphsComponent;
  let fixture: ComponentFixture<SystemProfileGraphsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemProfileGraphsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemProfileGraphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
