import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SwarmDetailPage } from './swarm-detail.page';

describe('SwarmDetailPage', () => {
  let component: SwarmDetailPage;
  let fixture: ComponentFixture<SwarmDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwarmDetailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SwarmDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
