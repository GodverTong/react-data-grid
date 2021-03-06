import { getColumnMetrics, getColumnScrollPosition } from './columnUtils';
import { ValueFormatter } from '../formatters';
import { Column } from '../types';
import { createColumns } from '../test/utils';

describe('getColumnMetrics', () => {
  interface Row {
    id?: number;
    title?: string;
    count?: string;
    frozenColumn1?: string;
    frozenColumn2?: string;
    frozenColumn3?: string;
  }

  const viewportWidth = 300;
  const getInitialColumns = (): Column<Row>[] => [{
    key: 'id',
    name: 'ID',
    width: 60
  }, {
    key: 'title',
    name: 'Title'
  }, {
    key: 'count',
    name: 'Count'
  }];

  it('should set the unset column widths based on the total width', () => {
    const rawColumns = getInitialColumns();
    const metrics = getColumnMetrics<Row, unknown>({
      rawColumns,
      viewportWidth,
      minColumnWidth: 50,
      columnWidths: new Map(),
      defaultResizable: false,
      defaultSortable: false,
      defaultFormatter: ValueFormatter
    });

    expect(metrics.columns[0].width).toStrictEqual(60);
    expect(metrics.columns[1].width).toStrictEqual(120);
    expect(metrics.columns[2].width).toStrictEqual(120);
  });

  it('should set the column left based on the column widths', () => {
    const rawColumns = getInitialColumns();
    const metrics = getColumnMetrics<Row, unknown>({
      rawColumns,
      viewportWidth,
      minColumnWidth: 50,
      columnWidths: new Map(),
      defaultResizable: false,
      defaultSortable: false,
      defaultFormatter: ValueFormatter
    });

    expect(metrics.columns[0].left).toStrictEqual(0);
    expect(metrics.columns[1].left).toStrictEqual(rawColumns[0].width);
    expect(metrics.columns[2].left).toStrictEqual(180);
  });

  it('should shift all frozen columns to the start of column metrics array', () => {
    const firstFrozenColumn: Column<Row> = { key: 'frozenColumn1', name: 'frozenColumn1', frozen: true };
    const secondFrozenColumn: Column<Row> = { key: 'frozenColumn2', name: 'frozenColumn2', frozen: true };
    const thirdFrozenColumn: Column<Row> = { key: 'frozenColumn3', name: 'frozenColumn3', frozen: true };
    const rawColumns = [...getInitialColumns(), secondFrozenColumn, thirdFrozenColumn];
    rawColumns.splice(2, 0, firstFrozenColumn);
    const metrics = getColumnMetrics<Row, unknown>({
      rawColumns,
      viewportWidth,
      minColumnWidth: 50,
      columnWidths: new Map(),
      defaultResizable: false,
      defaultSortable: false,
      defaultFormatter: ValueFormatter
    });
    expect(metrics.columns[0]).toMatchObject(firstFrozenColumn);
    expect(metrics.columns[1]).toMatchObject(secondFrozenColumn);
    expect(metrics.columns[2]).toMatchObject(thirdFrozenColumn);
  });
});

describe('getColumnScrollPosition', () => {
  describe('When canvas is scrolled left', () => {
    it('should calculate the scroll position for the selected column', () => {
      const columns = createColumns(10);
      const scrollPosition = getColumnScrollPosition(columns, 4, 500, 100);
      expect(scrollPosition).toBe(-100);
    });

    describe('When columns are frozen', () => {
      it('should calculate the scroll position for the selected column', () => {
        const columns = createColumns(10);
        columns[0].frozen = true;
        columns[1].frozen = true;
        const scrollPosition = getColumnScrollPosition(columns, 4, 500, 100);
        expect(scrollPosition).toBe(-300);
      });
    });
  });

  describe('When canvas is scrolled right', () => {
    it('should calculate the scroll position for the selected column', () => {
      const columns = createColumns(10);
      const scrollPosition = getColumnScrollPosition(columns, 7, 500, 100);
      expect(scrollPosition).toBe(200);
    });

    describe('When columns are frozen', () => {
      it('should calculate the scroll position for the selected column', () => {
        const columns = createColumns(10);
        columns[0].frozen = true;
        columns[1].frozen = true;
        const scrollPosition = getColumnScrollPosition(columns, 7, 500, 100);
        expect(scrollPosition).toBe(200);
      });
    });

    it('should calculate the scroll position for the selected column when client width is greater than the scroll width', () => {
      const columns = createColumns(10);
      columns[0].frozen = true;
      columns[1].frozen = true;
      const scrollPosition = getColumnScrollPosition(columns, 7, 500, 400);
      expect(scrollPosition).toBe(0);
    });
  });
});
