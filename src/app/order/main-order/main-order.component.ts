import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/primeng';
import * as _ from "lodash";

import { OrderService } from '../order.service';
import { MainService } from '../../lib/service/main.service';

@Component({
  selector: 'app-main-order',
  templateUrl: './main-order.component.html',
  styleUrls: ['./main-order.component.scss']
})
export class MainOrderComponent implements OnInit {
	
	constructor(
    private orderService: OrderService,
    private mainService: MainService
  ){}

  ngOnInit(){
    this.fetchServiceType();
  }
  
  // ============================================================================== //
  // Product Orders
  // ============================================================================== //
  public products = [];
  public loadingServiceType: boolean = false;
  private selectedProduct;
  private productAvailabel = ['STID-003','STID-004','STID-006','STID-007'];
  private productdDisabled = ['STID-004','STID-006'];
  fetchServiceType(){
    let dataUser = JSON.parse(this.mainService['dataUser']);
    if(dataUser != null){
      if(dataUser.UserCompanyMapping[0] != null){
        this.loadingServiceType = true;
        this.orderService.getServiceType(dataUser.UserCompanyMapping[0].BusinessUnitId).subscribe(res =>{
          this.products = [];
          _.map(res.Data, (x,i)=>{
            let obj = {
              Id: x.ServiceTypeId,
              productName: x.ServiceTypeName,
              link: _.kebabCase(x.ServiceTypeName),
              imgPath: './assets/images/icons/'+ x.ServiceTypeId +'.png'
            };

            if(_.includes(this.productdDisabled, x.ServiceTypeId)){
              obj['disabled'] = true;
            }else{
              obj['disabled'] = false;
            }
            
            if(_.includes(this.productAvailabel, x.ServiceTypeId)){
              this.products.push(obj);
            }
          });
          
          this.loadingServiceType = false;
          this.selectedProduct = this.products[0];
        }, err =>{
          if(err.status == 401){
            this.mainService.updateToken(() =>{
              this.fetchServiceType();
            });
          }

          if(err.name == "TimeoutError"){
            this.fetchServiceType();
          }
        });
      }
    }
  }
}
