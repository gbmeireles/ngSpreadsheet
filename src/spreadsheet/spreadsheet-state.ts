import { Injectable, FactoryProvider } from '@angular/core';
import {
  SpreadsheetSectionPositionInformationMap,
  ColumnPositionInformationMap,
  ColumnDefinition,
  Column,
  SpreadsheetColumn,
  SpreadsheetSection,
  Cell,
  SpreadsheetRow,
  ContentTypeEnum,
  CellLocation,
} from '../model';

@Injectable()
export class SpreadsheetState {
  activeRowIndexList: number[];
  activeCellLocation: CellLocation;
  columnDefinitionList: ColumnDefinition[];
  columnList: Column[];
  filterExpressionMap: { [spreadsheetColumnIndex: number]: string };
  spreadsheetColumnList: SpreadsheetColumn[];
  columnPositionInformationMap: ColumnPositionInformationMap;
  bodyHeight: number;
  totalHeight: number;
  dataRowHeight: number;
  titleRowHeight: number;
  scrollTop: number;
  spreadsheetSectionScrollWidthMap: { [spreadsheetSectionName: string]: number };
  spreadsheetSectionScrollLeftMap: { [spreadsheetSectionName: string]: number };
  isFilterOpenMap: { [columnIndex: number]: boolean };
  getRowStyle: (dataRow, rowType: ContentTypeEnum, rowIndex: number) => string;
  spreadsheetSectionList: SpreadsheetSection[];
  spreadsheetSectionPositionInformationMap: SpreadsheetSectionPositionInformationMap;
  spreadsheetSectionColumnToRendexIndexListMap: { [spreadsheetSectionName: string]: number[] };
  dataRowList: any[];
  originalDataRowList: any[];
  spreadsheetWidth: number;
  numberDataRowList: SpreadsheetRow[];
  numberTitleRowList: SpreadsheetRow[];
  titleSpreadsheetRowList: SpreadsheetRow[];
  dataSpreadsheetRowList: SpreadsheetRow[];
  isToShowStatusBar: boolean;

  constructor(spreadsheetState?: SpreadsheetState) {
    if (spreadsheetState == null) {
      this.activeRowIndexList = [];
      this.activeCellLocation = { rowIndex: 0, columnIndex: 0 };
      this.columnDefinitionList = [];
      this.columnList = [];
      this.spreadsheetColumnList = [];
      this.filterExpressionMap = {};
      this.columnPositionInformationMap = {};
      this.isFilterOpenMap = {};
      this.totalHeight = 0;
      this.bodyHeight = 0;
      this.dataRowHeight = 20;
      this.scrollTop = 0;
      this.spreadsheetSectionList = [];
      this.spreadsheetSectionScrollWidthMap = {};
      this.spreadsheetSectionPositionInformationMap = {};
      this.dataRowList = [];
      this.originalDataRowList = [];
      this.spreadsheetWidth = 0;
      this.numberDataRowList = [];
      this.numberTitleRowList = [];
      this.spreadsheetSectionColumnToRendexIndexListMap = {};
      this.titleSpreadsheetRowList = [];
      this.dataSpreadsheetRowList = [];
      this.isToShowStatusBar = false;
      return;
    }
  }
}

export default SpreadsheetState;
export const SPREADSHEET_STATE_PROVIDERS = [
  <FactoryProvider>{
    deps: [],
    multi: false,
    provide: SpreadsheetState,
    useFactory: () => { return new SpreadsheetState(); },
  },
];