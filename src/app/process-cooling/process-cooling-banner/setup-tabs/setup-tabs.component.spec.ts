import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupTabsComponent } from './setup-tabs.component';

describe('SetupTabsComponent', () => {
  let component: SetupTabsComponent;
  let fixture: ComponentFixture<SetupTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetupTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetupTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
