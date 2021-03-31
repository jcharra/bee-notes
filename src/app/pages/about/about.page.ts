import { Component, OnInit } from '@angular/core';
import { PurchaseService } from 'src/app/purchase.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {
  coffeeAvailable: boolean;

  constructor(private purchaseService: PurchaseService) { }

  ngOnInit() {
  }

  donateCoffee() {
    this.purchaseService.purchaseCoffee();
  }
}
