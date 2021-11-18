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
import styled from 'styled-components';
import { C, L } from './styles';

const S = {
  table: styled.tbody`
    border: 1px solid ${C.shade2};
    background-color: ${C.shade3};
  `,
  tr: styled.tr`
    :hover {
      outline: 4px solid ${C.blue1};
    }
  `,
  td: styled.td`
    padding: ${L.paddingSm};
  `,
  versionTag: styled.span`
    color: ${C.yellow};
  `,
};

type ComponentsVersionsMapProps = {
  [componentId: string]: string;
};

export default function ComponentsVersionsMap(props: ComponentsVersionsMapProps) {
  return (
    <S.table>
      {Object.entries(props.data).map(([componentId, versionTag]) => {
        return (
          <S.tr key={`${componentId}:${versionTag}`}>
            <S.td>{componentId}</S.td>
            <S.td>
              <S.versionTag>{versionTag}</S.versionTag>
            </S.td>
          </S.tr>
        );
      })}
    </S.table>
  );
}
