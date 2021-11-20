/*
 * Copyright 2020 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import { usePagination, useTable } from 'react-table';
import styled from 'styled-components';
import ElapsedTimer from '../elapsed-timer';
import { Setup, TestResult } from '@drill4j/vee-ledger';
import ComponentsVersionsMap from '../components-versions-map';
import NoRender from '../no-render';
import { sortBy } from './util';
import { ColumnDetails } from './types';
import { T } from './styles';
import { Pagination } from './Pagination';

type VersionTableProps = {
  setup: Setup;
  tests: TestResult[];
};

const S = {
  Table: styled.table`
    white-space: nowrap;
    min-width: 100%;
  `,
};

const INIT_PAGE_SIZE = 5;
export default function SetupTestsTable(props: VersionTableProps) {
  const { tests } = props;
  const data = React.useMemo<ColumnDetails[]>(
    () =>
      tests.sort(sortBy('date')).map(x => ({
        date: x.date,
        status: x.status,
        description: x.description,
        componentVersionMap: x.componentVersionMap,
      })),
    [tests, tests.length], // FIXME
  );

  const columns = React.useMemo(
    () => [
      {
        Header: 'Date',
        accessor: 'date',
        Cell: (props: any) => {
          return <ElapsedTimer start={props.row.values.date} />;
        },
      },
      {
        Header: 'Description',
        accessor: 'description',
        Cell: (props: any) => {
          const text = props.row.values.description;
          if (!text) return null;
          // TODO move it elsewhere
          const MAX_LEN = 10;
          if (text.length < MAX_LEN) {
            return text;
          }
          return <NoRender label={`${text.slice(0, 10)}...`}>{text}</NoRender>;
        },
      },
      {
        Header: 'Status',
        accessor: 'status',
      },
      {
        Header: 'Versions',
        accessor: 'componentVersionMap',
        Cell: (props: any) => {
          return (
            <NoRender label="versions">
              <ComponentsVersionsMap data={props.row.values.componentVersionMap} />
            </NoRender>
          );
        },
      },
    ],
    [],
  );

  const tableInstance = useTable({ columns, data, initialState: { pageSize: INIT_PAGE_SIZE } } as any, usePagination);
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;
  const { page }: any = tableInstance;

  return (
    <div>
      <S.Table {...getTableProps()}>
        <thead>
          {
            // Loop over the header rows
            headerGroups.map(headerGroup => (
              // Apply the header row props
              <T.Tr {...headerGroup.getHeaderGroupProps()}>
                {
                  // Loop over the headers in each row
                  headerGroup.headers.map(column => (
                    // Apply the header cell props
                    <T.Th {...column.getHeaderProps()}>
                      {
                        // Render the header
                        column.render('Header')
                      }
                    </T.Th>
                  ))
                }
              </T.Tr>
            ))
          }
        </thead>
        {/* Apply the table body props */}
        <tbody {...getTableBodyProps()}>
          {rows.length <= 0 && (
            <T.Tr>
              <T.Td colSpan={columns.length}>No data on setup tests</T.Td>
            </T.Tr>
          )}
          {rows.length > 0 &&
            page.map((row: any) => {
              // Prepare the row for display
              prepareRow(row);
              return (
                // Apply the row props
                <T.Tr {...row.getRowProps()}>
                  {
                    // Loop over the rows cells
                    row.cells.map((cell: any) => {
                      // Apply the cell props
                      return (
                        <T.Td {...cell.getCellProps()}>
                          {
                            // Render the cell contents
                            cell.render('Cell')
                          }
                        </T.Td>
                      );
                    })
                  }
                </T.Tr>
              );
            })}
        </tbody>
      </S.Table>
      <Pagination tableInstance={tableInstance} />
    </div>
  );
}
