import { Injectable } from '@angular/core';
import { SpreadsheetState } from '../spreadsheet/spreadsheet-state';
@Injectable()
export class RowViewportVisibleRowCountGetter {
  constructor() {

  }

  get(spreadsheetState: SpreadsheetState) {
    var bodyHeight = spreadsheetState.bodyHeight;
    var rowHeight = spreadsheetState.dataRowHeight;

    if (rowHeight === undefined) {
      throw 'Row height is not defined';
    }
    if (rowHeight === 0) {
      return 0;
    }

    var visibleRowCount = Math.ceil(bodyHeight / rowHeight);

    return visibleRowCount;
  }
}