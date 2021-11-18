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
/* eslint-disable react/jsx-pascal-case */

import { useState } from 'react';
import styled from 'styled-components';
import { C } from './styles';

type ExpanderStateProps = { isExpanded: boolean };

const Styled = {
  wrapper: styled.div``,
  button: styled.div`
    color: ${C.white};
    text-decoration: underline;
    cursor: pointer;
    :hover {
      color: ${C.blue3};
    }
  `,
  inner: styled.div`
    transform: ${({ isExpanded }: ExpanderStateProps) => (isExpanded ? 'translateY(0%)' : 'translateY(-100%)')};
  `,
  children: styled.div``,
};

export default function NoRender({ initialRender = false, label, children }: NoRenderProps) {
  const [isRendered, setIsRendered] = useState(initialRender);

  return (
    <Styled.wrapper title="click to expand">
      <Styled.button onClick={() => setIsRendered(!isRendered)}>{label}</Styled.button>
      {isRendered && <Styled.children>{children}</Styled.children>}
    </Styled.wrapper>
  );
}

export type NoRenderProps = { initialRender?: boolean; label: string; children: any };
