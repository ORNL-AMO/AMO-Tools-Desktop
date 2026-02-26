import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemProfileComponent } from './system-profile.component';

describe('SystemProfileComponent', () => {
  let component: SystemProfileComponent;
  let fixture: ComponentFixture<SystemProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
