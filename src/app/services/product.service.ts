import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../common/product';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductCategory } from '../common/product-category';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {



  private baseUrl = environment.theApiBaseUrl+'/products';
  private baseCategoriesUrl = environment.theApiBaseUrl+'/product-category';


  constructor(private httpClient: HttpClient) { }


  getProduct(prodId: number): Observable<Product> {

    // need to build URL based on category id 
    const searchUrl = `${this.baseUrl}/${prodId}`;
    return this.httpClient.get<Product>(searchUrl);
  }


  getProductList(theCategoryId: number): Observable<Product[]> {

    // need to build URL based on category id 
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`;
    return this.getproducts(searchUrl);
  }

  getProductListpaginate(thepage: number, thepageSize: number, theCategoryId: number): Observable<GetResponseProducts> {

    // need to build URL based on category id  page and page_size
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}&page=${thepage}&size=${thepageSize}`;
    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  searchProducts(keywordValue: string): Observable<Product[]> {

    // need to build URL based on category id 
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${keywordValue}`;

    return this.getproducts(searchUrl);
  }

  searchProductpaginate(thepage: number, thepageSize: number, keywordValue: string): Observable<GetResponseProducts> {

    // need to build URL based on category id  page and page_size
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${keywordValue}&page=${thepage}&size=${thepageSize}`;
    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  private getproducts(searchUrl: string): Observable<Product[]> {
    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
      map(response => response._embedded.products)
    );
  }

  getProductCategories(): Observable<ProductCategory[]> {

    return this.httpClient.get<GetResponseProductCategories>(this.baseCategoriesUrl).pipe(
      map(response => response._embedded.productCategory)
    );
  }
}




interface GetResponseProductCategories {
  _embedded: {
    productCategory: ProductCategory[];
  }
}

interface GetResponseProducts {
  _embedded: {
    products: Product[];
  },
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}