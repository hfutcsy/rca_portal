import { Component, OnInit } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FilterService } from 'src/app/services/filter.service';
import { FilterCondition } from '@app/entities/filterCondition';
import { RequestProxyService } from '@app/services/httpRequest/request-proxy.service';
import { MatChipInputEvent } from '@angular/material';


@Component({
  selector: 'app-filter-condition',
  templateUrl: './filter-condition.component.html',
  styleUrls: ['./filter-condition.component.css']
})
export class FilterConditionComponent implements OnInit {
  public isDetailFilterPanelOpen = false;
  impactedProducts = [];
  fixVersionList: string[] = [];
  componentList: string[] = [];
  readoutLevelList: string[] = [];


  public inputID: string = '';
  private _selectedProduct = null;
  get selectedProduct() { return this._selectedProduct; }
  set selectedProduct(value) {
    if (value != this._selectedProduct) {
      this._selectedProduct = value;

      this.fixVersionList = [];
      this.requestProxyService.GetProductVersions(this._selectedProduct).then(versions => {
        this.fixVersionList = versions;
      });

      this.componentList = [];
      this.requestProxyService.GetProductComponents(this._selectedProduct).then(components => {
        this.componentList = components;
      })
    }
  }
  private selectedVersions = [];
  private selectedComponents = [];
  public inputSubmitter: string = '';
  public inputRootCauseCR: string = '';

  public selectedreadoutLevels = [];


  public inputKeywords: string[] = [];
  public Keyword_tips: string[] = [];
  addKeyword(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim() &&
      !this.inputKeywords.includes(value) &&
      this.inputKeywords.length < 3) {
      this.inputKeywords.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  removeKeyword(Keyword: string): void {
    const index = this.inputKeywords.indexOf(Keyword);

    if (index >= 0) {
      this.inputKeywords.splice(index, 1);
    }
  }

  keyword_tip_click(keywordTip: string) {
    if ((keywordTip || '').trim() &&
      !this.inputKeywords.includes(keywordTip) &&
      this.inputKeywords.length < 3) {
      this.inputKeywords.push(keywordTip.trim());
    }
  }

  get isNothingInput() {
    return !this.inputID &&
      !this.selectedProduct &&
      this.selectedVersions.length == 0 &&
      this.selectedComponents.length == 0 &&
      !this.inputSubmitter &&
      !this.inputRootCauseCR &&
      this.selectedreadoutLevels.length == 0 &&
      this.inputKeywords.length == 0 &&
      !this.inputQuickSearch;
  }

  constructor(private filterSrv: FilterService,
    private requestProxyService: RequestProxyService) { }

  loadProductInfo() {
    this.requestProxyService.GetProducts().then(productNames => {
      this.impactedProducts = productNames;
    });
  }

  loadReadoutLevelInfo() {
    this.requestProxyService.GetReadOutLevel().then(readoutLevels => {
      this.readoutLevelList = readoutLevels;
    });
  }

  loadKeyowrdTips() {
    this.Keyword_tips = [];
    this.requestProxyService.GetHotKeywords(0, 10).then(hotKeywords => {
      hotKeywords.forEach(keyword => {
        this.Keyword_tips.push(keyword.KeywordValue);
      })
    })
  }

  triggerDetailFilterPanel() {
    this.isDetailFilterPanelOpen = !this.isDetailFilterPanelOpen;
  }

  onCancel() {
    this.isDetailFilterPanelOpen = false;
  }

  onApply() {
    this.isDetailFilterPanelOpen = false;
    let filterCondition = new FilterCondition();
    filterCondition.ID = this.inputID;
    filterCondition.ImpactedProduct = this.selectedProduct;
    filterCondition.Components = this.selectedComponents;
    filterCondition.FixVersions = this.selectedVersions;
    filterCondition.ReadoutLevels = this.selectedreadoutLevels;
    filterCondition.Keywords = this.inputKeywords;
    filterCondition.RootCauseCR = this.inputRootCauseCR;
    filterCondition.Submitter = this.inputSubmitter;
    filterCondition.QuickSearch = this.inputQuickSearch;

    this.clear();

    this.filterSrv.showFilterResults(filterCondition);
  }

  clear() {
    this.inputID = '';
    this.selectedProduct = null;
    this.selectedVersions = [];
    this.selectedComponents = [];
    this.inputSubmitter = '';
    this.inputRootCauseCR = '';
    this.selectedreadoutLevels = [];
    this.inputKeywords = [];
    this.inputQuickSearch = '';
  }

  ngOnInit() {
    this.loadProductInfo();
    this.loadReadoutLevelInfo();
    this.loadKeyowrdTips();

    this.initDetailData();

    this.initChipsData();

    this.filterSrv.filterConditionChangeEvent.subscribe(() => {
      this.initDetailData();

      this.initChipsData();
    });
  }

  initDetailData() {
    let initFilterCondition = this.filterSrv.currentFilterCondition;

    this.inputID = initFilterCondition.ID;
    this.selectedProduct = initFilterCondition.ImpactedProduct;
    this.selectedVersions = initFilterCondition.FixVersions;
    this.selectedComponents = initFilterCondition.Components;
    this.inputSubmitter = initFilterCondition.Submitter;
    this.inputRootCauseCR = initFilterCondition.RootCauseCR;
    this.selectedreadoutLevels = initFilterCondition.ReadoutLevels;
    this.inputKeywords = initFilterCondition.Keywords;
    this.inputQuickSearch = initFilterCondition.QuickSearch;
  }

  ///////////////////////////////For chips and Quick search//////////////////////////////////////
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  coditions: Array<ChipCondition> = [];

  initChipsData() {
    this.coditions = [];
    let initFilterCondition = this.filterSrv.currentFilterCondition;

    if (initFilterCondition.ID) {
      this.coditions.push(new ChipCondition('ID', initFilterCondition.ID, 'accent'));
      return;
    }

    if (initFilterCondition.ImpactedProduct) {
      this.coditions.push(new ChipCondition('IMPACTED PRODUCT', initFilterCondition.ImpactedProduct, 'accent'));
    }

    if (initFilterCondition.FixVersions && initFilterCondition.FixVersions.length > 0) {
      this.coditions.push(new ChipCondition('FIX VERSIONS', initFilterCondition.FixVersions, 'primary'));
    }

    if (initFilterCondition.Components && initFilterCondition.Components.length > 0) {
      this.coditions.push(new ChipCondition('COMPONENTS', initFilterCondition.Components, 'primary'));
    }

    if (initFilterCondition.Submitter) {
      this.coditions.push(new ChipCondition('SUBMITTER', initFilterCondition.Submitter, 'warn'));
    }

    if (initFilterCondition.RootCauseCR) {
      this.coditions.push(new ChipCondition('ROOT CAUSE CR', initFilterCondition.RootCauseCR, 'warn'));
    }

    if (initFilterCondition.ReadoutLevels && initFilterCondition.ReadoutLevels.length > 0) {
      this.coditions.push(new ChipCondition('READOUT LEVELS', initFilterCondition.ReadoutLevels, 'warn'));
    }

    if (initFilterCondition.Keywords && initFilterCondition.Keywords.length > 0) {
      this.coditions.push(new ChipCondition('KEYWORDS', initFilterCondition.Keywords, 'warn'));
    }

    if ((initFilterCondition.QuickSearch || '').trim()) {
      this.coditions.push(new ChipCondition('', initFilterCondition.QuickSearch, 'normal'));
    }
  }

  remove(codition: ChipCondition): void {
    const index = this.coditions.indexOf(codition);
    if (index >= 0) {
      this.coditions.splice(index, 1);

      switch (codition.key) {
        case 'ID':
          this.inputID = null;
          break;
        case 'IMPACTED PRODUCT':
          this.selectedProduct = null;
          break;
        case 'FIX VERSIONS':
          this.selectedVersions = [];
          break;
        case 'COMPONENTS':
          this.selectedComponents = [];
          break;
        case 'SUBMITTER':
          this.inputSubmitter = null;
          break;
        case 'ROOT CAUSE CR':
          this.inputRootCauseCR = null;
          break;
        case 'READOUT LEVELS':
          this.selectedreadoutLevels = [];
          break;
        case 'KEYWORDS':
          this.inputKeywords = [];
          break;
        case '':
          this.inputQuickSearch = null;
          break;
      }

      this.onApply();
    }
  }

  inputQuickSearch: string = '';
  quickSearch(): void {

    if ((this.inputQuickSearch || '').trim()) {
      this.onApply();
    }
  }
}

class ChipCondition {
  key: string;
  value: string;
  color: string;

  constructor(key, value, color) {
    this.key = key;
    this.value = value;
    this.color = color;
  }
}
