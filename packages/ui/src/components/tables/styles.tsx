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
import { C, L } from '../styles';

export const T = {
  Td: styled.td`
    background-color: ${C.shade2};
    border: 1px solid ${C.shade3};
    color: ${C.white};
    padding: ${L.paddingSm} ${L.paddingMd};
    vertical-align: top;
    :empty {
      background-color: rgba(45, 45, 45, 0.8);
    }
  `,
  Th: styled.th`
    background-color: ${C.shade2};
    border: 1px solid ${C.shade3};
    color: ${C.white};
    padding: ${L.paddingSm} ${L.paddingMd};
  `,
  Tr: styled.tr`
    :hover {
      outline: 4px solid ${C.blue1};
    }
  `,
};
