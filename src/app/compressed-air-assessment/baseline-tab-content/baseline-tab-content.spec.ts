import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaselineTabContent } from './baseline-tab-content';

describe('BaselineTabContent', () => {
  let component: BaselineTabContent;
  let fixture: ComponentFixture<BaselineTabContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaselineTabContent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaselineTabContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
