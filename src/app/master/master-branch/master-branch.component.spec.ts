import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterBranchComponent } from './master-branch.component';

describe('MasterBranchComponent', () => {
  let component: MasterBranchComponent;
  let fixture: ComponentFixture<MasterBranchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MasterBranchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterBranchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
