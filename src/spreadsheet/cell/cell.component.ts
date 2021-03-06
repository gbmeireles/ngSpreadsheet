import {
  Component,
  ComponentRef,
  forwardRef,
  ComponentFactoryResolver,
  Input,
  ElementRef,
  Injector,
  HostBinding,
  HostListener,
  ChangeDetectorRef,
  SimpleChange,
  ApplicationRef,
  ViewChild,
  ReflectiveInjector,
  AfterViewInit,
  ViewContainerRef,
  Inject,
  EventEmitter,
  OnInit,
  OnDestroy,
  Optional,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  Cell,
  SpreadsheetCell,
  ColumnPositionInformationMap,
  ContentTypeEnum,
  CellLocation,
} from '../../model';
import {
  DISPATCHER_TOKEN,
  Action,
  UpdateColumnSizeAction,
  GoToCellLocationAction,
} from '../../events/events';
import {
  CellPositionUpdater,
  CellManager,
} from '../../services/services';
import {
  EditableComponent,
  ViewableComponent,
} from '../model/custom.component';
import { Subscription } from 'rxjs';

import { IsCellActiveChecker } from './is-cell-active-checker';
import { SpreadsheetState } from '../spreadsheet-state';
import { BodySectionComponent } from '../body-section';

@Component({
  selector: 'Cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellComponent implements OnInit, OnDestroy, Cell, AfterViewInit {
  @Input('cell') spreadsheetCell: SpreadsheetCell;
  @Input('rowData') rowData: any;
  @Input('rowHeight') rowHeight: number;
  @Input('index') index: number;
  @Input('columnPositionInformationMap') columnPositionInformationMap: ColumnPositionInformationMap;
  @Input('spreadsheetSectionScrollLeft') spreadsheetSectionScrollLeft: number;
  @Input('activeCellLocation') activeCellLocation: CellLocation;
  @HostBinding('style.zIndex') zIndex: number = 1;
  @HostBinding('style.height.px') height: number;
  @HostBinding('style.width.px') width: number;
  @HostBinding('style.left.px') left: number;
  @HostBinding('style.margin-left.px') marginLeft: number;
  @HostBinding('class.is-active') isActive: boolean = false;
  @HostBinding('class.is-custom') isCustom: boolean = false;
  @HostBinding('class') style;
  @ViewChild('cellComponent', { read: ViewContainerRef }) cellViewContainer: ViewContainerRef;
  spreadsheetColumnIndex: number;
  data: any;
  isEditing: boolean = false;
  private viewComponent: ComponentRef<ViewableComponent>;
  private editComponent: ComponentRef<EditableComponent>;

  constructor(private resolver: ComponentFactoryResolver,
    private el: ElementRef,
    private app: ApplicationRef,
    private cellPositionUpdater: CellPositionUpdater,
    private cdr: ChangeDetectorRef,
    private viewContainerRef: ViewContainerRef,
    private isCellActiveChecker: IsCellActiveChecker,
    private cellManager: CellManager,
    private spreadsheetState: SpreadsheetState,
    private domSanitizer: DomSanitizer,
    @Inject(DISPATCHER_TOKEN) private eventEmitter: EventEmitter<Action>,
    @Optional() @Inject(forwardRef(() => BodySectionComponent)) private bodySectionComponent: BodySectionComponent) {
  }

  @HostListener('mousedown', ['$event'])
  onClick(evt) {
    if (!this.spreadsheetCell) {
      return;
    }
    this.eventEmitter.emit(new GoToCellLocationAction(this.spreadsheetCell.rowIndex, this.spreadsheetCell.columnIndex, true, false));
  }

  @HostListener('dblclick', ['$event'])
  onDoubleClick(evt) {
    if (!this.spreadsheetCell) {
      return;
    }
    this.eventEmitter.emit(new GoToCellLocationAction(this.spreadsheetCell.rowIndex, this.spreadsheetCell.columnIndex, true));
    this.goToEditMode();
  }

  ngOnChanges(changes: { [key: string]: SimpleChange }) {
    if (!this.spreadsheetCell) {
      this.clear();
      this.data = null;
      this.zIndex = 0;
      this.isActive = false;
      this.style = 'is-empty';
      return;
    }
    if (changes['spreadsheetCell']) {
      this.initCell(this.spreadsheetCell);
    }
    if (changes['spreadsheetCell'] || changes['rowHeight']) {
      this.height = this.spreadsheetCell.rowspan * this.rowHeight;
    }
    if (changes['rowData'] || changes['spreadsheetSectionScrollLeft'] || changes['columnPositionInformationMap']) {
      if (this.columnPositionInformationMap) {
        this.width = 0;
        var index = 0;
        while (index < this.spreadsheetCell.colspan) {
          let columnPositionInformation = this.columnPositionInformationMap[this.spreadsheetColumnIndex + index];
          this.width += columnPositionInformation ? columnPositionInformation.width : 0;
          index++;
        }
      }
    }
    if (changes['spreadsheetCell'] || changes['rowData'] || changes['spreadsheetSectionScrollLeft'] || changes['columnPositionInformationMap']) {
      let columnPositionInformation = this.columnPositionInformationMap[this.spreadsheetColumnIndex];
      var left = columnPositionInformation ? columnPositionInformation.left : 0;
      this.left = left;
    }
    if (changes['activeCellLocation']) {
      this.isActive = this.isCellActiveChecker.check(this.spreadsheetCell, this.activeCellLocation);
      if (this.editComponent && !this.isActive) {
        this.confirmEdit();
      } else {
        this.updateZIndex();
      }
    }
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.cellManager.addCell(this);

    if (!this.spreadsheetCell) {
      this.style = 'is-empty';
      return;
    }
    this.initCell(this.spreadsheetCell);
  }

  getElement(): HTMLElement {
    return this.el.nativeElement;
  }

  confirmEdit() {
    if (!this.editComponent || !this.isEditing) {
      return;
    }

    this.editComponent.instance.onEditDone(this.rowData);
    this.goToViewMode();
    this.updateZIndex();
  }

  goToEditMode() {
    if (this.spreadsheetCell.editableComponentType && !this.isEditing) {
      this.isCustom = true;
      this.cdr.markForCheck();
      this.isEditing = true;
      this.clear();

      var factory = this.resolver.resolveComponentFactory<EditableComponent>(<any>this.spreadsheetCell.editableComponentType);
      var componentRef = this.cellViewContainer.createComponent(factory);
      this.editComponent = componentRef;
      componentRef.instance.onEditStarted(this.rowData);
      componentRef.onDestroy(() => {
        this.isEditing = false;
        this.bodySectionComponent.focus();
      });
    } else {
      this.isCustom = false;
    }
  }

  cancelEdit() {
    if (this.editComponent) {
      var editableComponent = <EditableComponent>this.editComponent.instance;
      editableComponent.onCancelEdit(this.rowData);
      this.goToViewMode();
    }
  }

  goToViewMode() {
    this.clear();
    if (this.spreadsheetCell.viewableComponentType) {
      this.isCustom = true;
      if (!this.cellViewContainer) {
        return;
      }
      if (this.viewComponent) {
        this.viewComponent.destroy();
      }
      var factory = this.resolver.resolveComponentFactory(this.spreadsheetCell.viewableComponentType);
      var componentRef = this.cellViewContainer.createComponent(factory);
      this.viewComponent = componentRef;
      componentRef.instance.onRowInit(this.rowData);
      this.cdr.markForCheck();

    } else if (this.spreadsheetCell.formatData !== undefined) {
      this.isCustom = false;

      let data = this.spreadsheetCell.formatData(this.spreadsheetCell.data);
      if (this.spreadsheetCell.cellType === ContentTypeEnum.Title) {
        this.data = this.domSanitizer.bypassSecurityTrustHtml(data);
      } else {
        this.data = data;
      }
    } else {
      this.isCustom = false;
      let data = this.spreadsheetCell.data;
      if (this.spreadsheetCell.cellType === ContentTypeEnum.Title) {
        this.data = this.domSanitizer.bypassSecurityTrustHtml(data);
      } else {
        this.data = data;
      }
    }
  }

  getScrollWidth() {
    return this.el.nativeElement.scrollWidth;
  }

  ngOnDestroy() {
    this.cellManager.removeCell(this);
  }

  private initCell(spreadsheetCell: SpreadsheetCell) {
    this.spreadsheetColumnIndex = spreadsheetCell.columnIndex;
    this.style = spreadsheetCell.cellStyle;

    if (spreadsheetCell.isEditing) {
      this.goToEditMode();
    } else {
      this.goToViewMode();
    }

    this.isActive = this.isCellActiveChecker.check(spreadsheetCell, this.activeCellLocation);
    if (this.isActive && this.style) {
      this.style += ' is-active';
    }
    if (this.isCustom && this.style) {
      this.style += ' is-custom';
    }
    this.updateZIndex();
  }

  private updateZIndex() {
    this.zIndex = 1;
    if (this.spreadsheetCell.rowspan > 1) {
      this.zIndex = 2;
    } else if (this.spreadsheetCell.colspan > 1) {
      this.zIndex = 3;
    }
    if (this.isActive) {
      this.zIndex = 4;
    }
  }

  private clear() {
    this.data = null;
    if (this.viewComponent) {
      this.viewComponent.destroy();
    }
    if (this.editComponent) {
      this.editComponent.destroy();
      this.editComponent = null;
    }
    if (this.cellViewContainer) {
      this.cellViewContainer.clear();
    }
  }
}