import { Component, OnInit } from '@angular/core';
import { PurchaseService } from 'src/app/services/purchase.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {
  coffeeAvailable: boolean;

  constructor(private purchaseService: PurchaseService) { }

  ngOnInit() {
    this.coffeeAvailable = this.purchaseService.purchasesAvailable;
  }

  donateCoffee() {
    this.purchaseService.purchaseCoffee();
  }
}
