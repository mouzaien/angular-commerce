import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})
export class MenuBarComponent implements OnInit {
  public isMenuCollapsed !:boolean ;
  constructor() {

  }

  ngOnInit(): void {
    this.isMenuCollapsed = true;
    console.log(this.isMenuCollapsed);
  }

}
