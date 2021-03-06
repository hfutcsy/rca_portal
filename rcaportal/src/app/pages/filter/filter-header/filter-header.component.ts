import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RcaDialogService } from 'src/app/services/rca-dialog.service';

import { FilterService } from 'src/app/services/filter.service';

import { AuthenticationService } from '@app/services/authentication.service';
import { User } from '@app/entities/user';
import { FilterCondition } from '@app/entities/filterCondition';


@Component({
  selector: 'app-filter-header',
  templateUrl: './filter-header.component.html',
  styleUrls: ['./filter-header.component.css']
})
export class FilterHeaderComponent implements OnInit {

  currentUser: string;
  // tslint:disable-next-line: max-line-length
  constructor(private router: Router, private rcaDialogSrv: RcaDialogService, private filterSrv: FilterService, private authenticationService: AuthenticationService) { }


  ngOnInit() {
    this.currentUser = this.authenticationService.currentUserName;
  }

  onHomeClick(){
    this.router.navigateByUrl('/home');
  }

  onMyCRsClick(){
    let filterCondition = new FilterCondition();
    filterCondition.Submitter = this.currentUser;

    this.filterSrv.showFilterResults(filterCondition);
  }

  onAddCRClick(){
    this.rcaDialogSrv.openCreateDialog();
  }

  logout() {
    this.authenticationService.logout();
    // .then( bsucceed => {
    //   if (bsucceed) {
    //     this.router.navigate(['/login']);
    //   }});
    }
}
