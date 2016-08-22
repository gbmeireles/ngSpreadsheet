import { SpreadsheetCell } from './SpreadsheetCell';

export interface Cell {
    left: number;
    width: number;
    spreadsheetColumnIndex: number;
    sectionColumnIndex?: number;
    getScrollWidth: () => number;
    spreadsheetCell: SpreadsheetCell;
    isActive: boolean;
    goToEditMode?: () => void;
    cancelEdit?: () => void;
    isEditing?: boolean;
}