import { render } from '@testing-library/react';
import { DataTable, Column } from '../data-table';

interface Row { name: string; value: number; }
const columns: Column<Row>[] = [
  { key: 'name', header: 'Name' },
  { key: 'value', header: 'Value', align: 'right' },
];
const data: Row[] = [{ name: 'Apple', value: 100 }, { name: 'Google', value: 200 }];

describe('DataTable', () => {
  it('thead has sticky class', () => {
    const { container } = render(<DataTable data={data} columns={columns} />);
    const thead = container.querySelector('thead');
    expect(thead).toHaveClass('sticky');
    expect(thead).toHaveClass('top-0');
  });

  it('rows have hover class even without onRowClick', () => {
    const { container } = render(<DataTable data={data} columns={columns} />);
    const firstRow = container.querySelector('tbody tr');
    expect(firstRow).toHaveClass('hover:bg-gray-50');
  });

  it('rows have cursor-pointer only when onRowClick is provided', () => {
    const { container: withClick } = render(
      <DataTable data={data} columns={columns} onRowClick={() => {}} />
    );
    const { container: noClick } = render(
      <DataTable data={data} columns={columns} />
    );
    expect(withClick.querySelector('tbody tr')).toHaveClass('cursor-pointer');
    expect(noClick.querySelector('tbody tr')).not.toHaveClass('cursor-pointer');
  });
});
