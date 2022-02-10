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

import useLedgerData from '../github/hooks/use-ledger-data';
import connection from '../github/connection';

import Spinner from './spinner';
import User from './user';
import Nothing from './placeholder';

import FormAddComponent from './forms/add-component';
import FormAddSetup from './forms/add-setup';
import FormAddVersion from './forms/add-version';
import FormAddTest from './forms/add-test';
import FormStartSetupsForComponent from './forms/start-setups-for-component';
import FormStartSetup from './forms/start-setup';
import FormStartAllSetups from './forms/start-all-setups';
import VersionTable from './tables/version';
import ElapsedTimer from './elapsed-timer';
import SetupTestsTable from './tables/setup-tests';
import { DebugData } from './DebugData';
import NoRender from './no-render';
import Question from './question';
import { ElapsedSinceChange } from './elapsed-since-change';
import { useState } from 'react';
import { useClickOutside } from '../hooks/use-click-outside';

function App() {
  return (
    <div>
      <div className="header">
        <div style={{ marginRight: '15px' }}>
          {!connection.isConnected() ? ( // TODO useConnection
            <button onClick={() => connection.connect()}>Authenticate using GitHub</button>
          ) : (
            <button onClick={() => connection.disconnect()}>GitHub Logout</button>
          )}
        </div>
        <User />
        <LaunchTestsModals/>
        <UpdateLedgerModals/>
      </div>
      <div className="main-ui">{connection.isConnected() ? <RenderStuff /> : <Nothing authenticate={() => connection.connect()} />}</div>
    </div>
  );
}

function RenderStuff() {
  const { isLoading, data, ledger } = useLedgerData();
  if (isLoading || !ledger) return <Spinner>Loading ledger data...</Spinner>;

  if (!data) return <Spinner>ledger.json is not initialized. Make sure to follow setup instructions or contact dev team</Spinner>;

  return (
    <div className="px-2 pb-4">
      <div>
        Refreshed <ElapsedTimer />
        <ElapsedSinceChange />
      </div>
      <TopFixedWrapper>
        <NoRender label="Debug Data">
          <DebugData data={data} />
        </NoRender>
      </TopFixedWrapper>

      {/* VERSIONS */}
      <h3 className="mt-3">VERSIONS</h3>
      <VersionTable versions={data.versions} components={data.components} ledger={ledger} comments={data.comments}/>

      {/*SETUPS  */}
      <h3 className="mt-3">SETUPS</h3>
      <div className="row">
        {data.setups.map((setup: any) => {
          const setupTests = ledger.getSetupTests(setup.id);
          return (
            <div className="col-12 mb-3" key={setup.id}>
              <h5>{setup.name}</h5>
              <SetupTestsTable setup={setup} tests={setupTests} ledger={ledger}/>
            </div>
          );
        })}
      </div>
      <Question>IDEA #1: Append logs / links to logs</Question>
      <Question>IDEA #2: Allow to use @ to link Jira users/Jira issues?</Question>
      <Question>IDEA #3: Allow attachments?</Question>
      <Question>IDEA #4: Click-on-version/component to navigate to commit/rep/artifact?</Question>
    </div>
  );
}

function LaunchTestsModals ()  {
  const [selectedModal, setSelectedModal] = useState<"START_SETUP" | "START_ALL_SETUPS" | "START_SETUPS_FOR_COMPONENT" | null>(null)
  const { data, ledger } = useLedgerData();
  const ref = useClickOutside(() => setSelectedModal(null))
  if(!data || !ledger) return null

  return <div className="flex gap-x-3 p-2"  ref={ref}>
    Launch tests:
    <span className='link' onClick={() => setSelectedModal("START_SETUP")}>Setup</span>
    <span className='link' onClick={() => setSelectedModal("START_SETUPS_FOR_COMPONENT")}>For component</span>
    <span className='link' onClick={() => setSelectedModal("START_ALL_SETUPS")}>All</span>
    {selectedModal &&
      <div className="absolute top-10 flex flex-col bg-shade3 p-3 max-w-[500px]">
        {selectedModal === "START_SETUPS_FOR_COMPONENT" && <FormStartSetupsForComponent ledger={ledger} data={data} />}
        {selectedModal === "START_SETUP" && <FormStartSetup ledger={ledger} data={data} />}
        {selectedModal === "START_ALL_SETUPS" && <FormStartAllSetups ledger={ledger} data={data} />}
      </div>
    }
  </div>
}

function UpdateLedgerModals ()  {
  const [selectedModal, setSelectedModal] = useState<"COMPONENT" | "SETUP" | "VERSION" | "TEST_RESULT" | null>(null)
  const { data, ledger } = useLedgerData();
  const ref = useClickOutside(() => setSelectedModal(null))
  if(!data || !ledger) return null

  return <div className="flex gap-x-3 p-2" ref={ref}>
    Add:
    <span className='link' onClick={() => setSelectedModal("COMPONENT")}>Component</span>
    <span className='link' onClick={() => setSelectedModal("SETUP")}>Setup</span>
    <span className='link' onClick={() => setSelectedModal("VERSION")}>Version</span>
    <span className='link' onClick={() => setSelectedModal("TEST_RESULT")}>Test result</span>
    {selectedModal &&
      <div className="absolute top-10 flex flex-col bg-shade3 p-3 max-w-[500px]" >
        {selectedModal === "COMPONENT" && <FormAddComponent ledger={ledger} data={data} />}
        {selectedModal === "SETUP" && <FormAddSetup ledger={ledger} data={data} />}
        {selectedModal === "VERSION" && <FormAddVersion ledger={ledger} data={data} />}
        {selectedModal === "TEST_RESULT" && <FormAddTest ledger={ledger} data={data} />}
      </div>
    }
  </div>
}

const TopFixedWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  overflow-y: auto;
  background-color: black;
  max-height: 30vh;
`;
export default App;
