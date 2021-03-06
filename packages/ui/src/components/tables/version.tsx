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
import { useTable, usePagination } from 'react-table';
import styled from 'styled-components';
import ElapsedTimer from '../elapsed-timer';
import { Component, Version, Comment } from '@drill4j/vee-ledger';
import { T } from './styles';
import { ColumnDetails } from './types';
import { Pagination } from './Pagination';
import { sortBy } from './util';
import { Ledger } from '@drill4j/vee-ledger';
import useUser from '../../github/hooks/use-user';
import CommentCell from './cells/comment-cell';
import AddCommentCell from './cells/add-comment-cell';

type VersionTableProps = {
  components: Component[];
  versions: Version[];
  ledger: Ledger; // FIXME I don't like it
  comments: Record<string, Comment>;
};

const S = {
  Table: styled.table`
    white-space: nowrap;
  `,
  ScrollXWrapper: styled.div`
    overflow-x: auto;
  `,
};

const INIT_PAGE_SIZE = 10;
export default function VersionTable(props: VersionTableProps) {
  const { components, versions, ledger, comments } = props;
  const { data: userData } = useUser();

  const data = React.useMemo<ColumnDetails[]>(
    () =>
      versions.sort(sortBy('date')).map(x => ({
        release: x.date,
        [x.componentId]: x.tag,
      })),
    [], // FIXME
  );

  const columns = React.useMemo(
    () => [
      {
        Header: 'Release date',
        Latest: 'latests:',
        accessor: 'release',
        Cell: (props: any) => <ElapsedTimer start={props.row.values.release} />,
      },
      ...components.map(c => ({ Header: c.name, Latest: props.ledger.getLatestVersion(c.id)?.tag || '-', accessor: c.id })),
      {
        Header: 'Comments',
        Latest: '',
        accessor: 'comments',
        Cell: (props: any) => <CommentCell comment={comments[props.row.values.release]} />,
      },
      {
        Header: '',
        Latest: '',
        accessor: 'add-comment',
        Cell: (props: any) => (
          <AddCommentCell
            addComment={message =>
              ledger.addComment({ releaseComponentDate: props.row.values.release, message, userName: userData?.login })
            }
            comment={comments[props.row.values.release]}
          />
        ),
      },
    ],
    [userData], // FIXME
  );

  const tableInstance = useTable({ columns, data, initialState: { pageSize: INIT_PAGE_SIZE } } as any, usePagination);
  const { getTableProps, getTableBodyProps, headerGroups, prepareRow } = tableInstance;
  const { page }: any = tableInstance;

  // FIXME useMemo gets called in vain
  if (components.length === 0) {
    return <div>no components</div>;
  }
  if (versions.length === 0) {
    return <div>no versions</div>;
  }

  return (
    <div>
      <S.ScrollXWrapper>
        <S.Table {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup, i) => (
              <React.Fragment key={`headerGroup_0_${i}`}>
                <T.Tr {...{ ...headerGroup.getHeaderGroupProps(), key: `headerGroup_0_${i}` }}>
                  {headerGroup.headers.map(column => {
                    return (
                      <T.Td {...column.getHeaderProps()}>
                        <div>{(column as any).Latest && column.render('Latest')}</div>
                      </T.Td>
                    );
                  })}
                </T.Tr>
                <T.Tr {...{ ...headerGroup.getHeaderGroupProps(), key: `headerGroup_1_${i}` }}>
                  {headerGroup.headers.map(column => {
                    return (
                      <T.Th {...column.getHeaderProps()}>
                        <div>{column.render('Header')}</div>
                      </T.Th>
                    );
                  })}
                </T.Tr>
              </React.Fragment>
            ))}
          </thead>
          {/* Apply the table body props */}
          <tbody {...getTableBodyProps()}>
            {page.map((row: any) => {
              prepareRow(row);
              return (
                <T.Tr {...row.getRowProps()}>
                  {row.cells.map((cell: any) => {
                    return <T.Td {...cell.getCellProps()}>{cell.render('Cell')}</T.Td>;
                  })}
                </T.Tr>
              );
            })}
          </tbody>
        </S.Table>
      </S.ScrollXWrapper>
      <Pagination tableInstance={tableInstance} />
    </div>
  );
}
