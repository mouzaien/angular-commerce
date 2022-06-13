import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {

  product: Product = new Product;
  constructor(private productService: ProductService, private cartService: CartService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {

      this.handleProductDetails();
    })
  }
  handleProductDetails() {
    const prodId: number = 1;
    const newLocal = this.route.snapshot.paramMap.get('id');
    if (newLocal != null) {
      const prodId: number = +newLocal;
    }

    this.productService.getProduct(prodId).subscribe(
      data => {
        this.product = data;
      }
    );
  }
  addToCart() {
    console.log(`new product name ${this.product.name}, price ${this.product.unitPrice}`);
    const newcartItem = new CartItem(this.product);
    this.cartService.addToCart(newcartItem);

  }
}
