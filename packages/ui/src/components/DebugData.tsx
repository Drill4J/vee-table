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
import { LedgerData } from '../lib/types';
import styled from 'styled-components';

const Wrapper = styled.div`
  font-size: 12px;
  background-color: black;
`;

export function DebugData({ data }: { data: LedgerData }) {
  return (
    <Wrapper className="row">
      <div className="col-3">
        <div>Components</div>
        <Stats label="Components" data={data.components} />
      </div>
      <div className="col-3">
        <div>Setups</div>
        <Stats label="Setups" data={data.setups} />
      </div>
      <div className="col-3">
        <div>Versions</div>
        <Stats label="Versions" data={data.versions} keyProp="date" />
      </div>
      <div className="col-3">
        <div>Tests</div>
        <Stats label="Tests" data={data.tests} keyProp="date" />
      </div>
    </Wrapper>
  );
}
function Stats(props: any) {
  const { data, keyProp = 'id' } = props;
  if (!Array.isArray(data)) return <>{'...'}</>;
  return <div>{data.map((x: any) => RenderStat(x[keyProp], x))}</div>;
}
function RenderStat(key: string, data: any) {
  return (
    <div className="mb-2" key={key}>
      {JSON.stringify(data)},
    </div>
  );
}
