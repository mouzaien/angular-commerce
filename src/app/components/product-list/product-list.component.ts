import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/common/product';
import { ActivatedRoute } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { CartItem } from 'src/app/common/cart-item';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;
  searchMode: boolean = false;

  previousKeyword: string | undefined;

  // roperties for pagination
  thePageNumber: number = 1;
  thePageSize: number = 5;
  theTotalElements: number = 0;
  theTotalPages: number = 0;

  constructor(private productService: ProductService, private cartService: CartService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  listProducts() {
    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    if (this.searchMode) {
      this.handleSearchProducts();

    } else
      this.handleListProducts();
  }
  updatePageSize(_pageSize: number) {
    this.thePageSize = _pageSize;
    this.thePageNumber = 1;
    this.listProducts();
  }
  handleSearchProducts() {

    const keywordValue: string = this.route.snapshot.paramMap.get('keyword') as string;

    // test if previuos word different from current search word set pagenumber to 1
    if (this.previousKeyword != keywordValue) {
      this.thePageNumber = 1;
    }
    this.previousKeyword = keywordValue;

    this.productService.searchProductpaginate(this.thePageNumber, this.thePageSize, keywordValue).subscribe(this.processResult());
    // this.productService.searchProducts(keywordValue).subscribe(
    //   data => {

    //     this.products = data;
    //   }

    // )

  }


  handleListProducts() {

    // check if "id" parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      // get the "id" param string. convert string to a number using the "+" symbol
      let idStr = this.route.snapshot.paramMap.get('id');
      if (idStr != null)
        this.currentCategoryId = + idStr;
      else this.currentCategoryId = 1;
    }
    else {
      // not category id available ... default to category id 1
      this.currentCategoryId = 1;
    }

    // test if currentCategoryId != this.previousCategoryId
    if (this.currentCategoryId != this.previousCategoryId) {
      this.thePageNumber = 1;
    }

    this.previousCategoryId = this.currentCategoryId;

    // now get the products for the given category id page and size

    this.productService.getProductListpaginate(this.thePageNumber - 1,
      this.thePageSize,
      this.currentCategoryId)
      .subscribe(this.processResult());
  }

  processResult() {
    return data => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    };
  }

  addToCart(product: Product) {
    console.log(`adding to cart ${product.name}`);

    const cartitem = new CartItem(product);
    this.cartService.addToCart(cartitem);
  }
}




