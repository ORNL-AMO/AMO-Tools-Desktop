import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaselineTabsComponent } from './baseline-tabs.component';

describe('BaselineTabsComponent', () => {
  let component: BaselineTabsComponent;
  let fixture: ComponentFixture<BaselineTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaselineTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaselineTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
