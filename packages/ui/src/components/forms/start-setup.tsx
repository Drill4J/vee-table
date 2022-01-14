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
import { Formik, Form, Field, ErrorMessage } from 'formik';
import SelectField from './generic/select-field';
import Spinner from '../spinner';
import { LedgerData } from '@drill4j/vee-ledger';
import VersionsSelect from '../versions-select'
import { useEffect, useState } from 'react';
import { Ledger } from '@drill4j/vee-ledger';
import { RawVersion, Setup } from '@drill4j/vee-ledger/src/types-internal';
import connection from '../../github/connection';

interface AutotestsSetup {
  file: string;
  cypressEnv: Record<string, string>;
  params: Record<string, string>[];
}

export default (props: { ledger: Ledger; data: LedgerData }) => {
  const {setups} = props.data;
  const [autotestsSetups, setAutotestsSetups] = useState<Record<string, AutotestsSetup>>({});

  useEffect(() => {
    (async() => {
      try{
        const res = await fetch("https://raw.githubusercontent.com/Drill4J/e2e/main/setups.json")
        const data = await res.json();
        setAutotestsSetups(data)
      } catch (e) {
        alert('Failed fetch setups from e2e repo: ' + (e as any)?.message || JSON.stringify(e));
      }
    })()
  },[])

  return (
    <>
      <h3>Start tests for component</h3>
      <Formik
        initialValues={{setupId: '', isCustomAutotestParams: false, componentsVersions: {}, params: {}}}
        onSubmit={async ({ setupId, componentsVersions, params }) => {
          const response = await fetch("https://api.github.com/repos/Drill4J/e2e/dispatches", {
            method: "POST",
            body: JSON.stringify({
              event_type: "run_setup",
              client_payload: {
                versions: componentsVersions,
                params,
                setupId,
                cypressEnv: autotestsSetups[setupId].cypressEnv,
                specFile: autotestsSetups[setupId].file,
              }
            }),
            headers: {
              "Authorization": `Bearer ${connection.getAuthToken()}`
            }
          })
          if (!response.ok) {
            alert(`Failed to start setup: ${response.status}`);
          }
        }}
      >
        {({ isSubmitting, values,  }) => (
          <Form>
            <label htmlFor="start-setup-setup-id">Component</label>
            <Field
              id="start-setup-setup-id"
              name={'setupId'}
              component={SelectField()}
              options={Object.entries(autotestsSetups).map(([id]) => ({ value: id, label: id }))}
            />
            { values.setupId && <FormSetParams values={values} autotestsSetups={autotestsSetups}/>}
            <label htmlFor="add-test-field-status">Component Versions</label>
            <VersionsSelect componentIds={setups.find(({id}) =>  values.setupId === id)?.componentIds || []} ledger={props.ledger} fieldNamePrefix={'componentsVersions'}/>
            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
            {isSubmitting && <div>submitting...</div>}
          </Form>
        )}
      </Formik>
    </>
  );
};

function FormSetParams({values, autotestsSetups}: {values: any; autotestsSetups: Record<string, AutotestsSetup>}) {
  return <>
    <div style={{display: 'flex', gap: "8px", alignItems: 'center'}}>
      <label htmlFor='start-setups-custom-params-checkbox'>Custom autotest params</label>
      <Field
        id={'start-setups-custom-params-checkbox'}
        name={'isCustomAutotestParams'}
        type={'checkbox'}
      />
    </div>
    {/*I don't map it because now there are only two parameters*/}
    <label htmlFor='start-setups-params'>Autotests params</label>
    {values.isCustomAutotestParams ?
      <Field
        id={'start-setups-params'}
        name={'params.autotestsParams'}
        type={'text'}
      /> :
      <Field
        id={'start-setups-params'}
        name={'params.autotestsParams'}
        component={SelectField()}
        options={autotestsSetups[values.setupId].params.map(({autotestsParams}) => ({ value: autotestsParams, label: autotestsParams }))}
      />}
    <label htmlFor="start-setups-fixture-file">Fixture file (the file name must contain the framework name)</label>
    <Field
      id={'start-setups-fixture-file'}
      name={'params.fixtureFile'}
      component={SelectField()}
      options={autotestsSetups[values.setupId].params.map(({fixtureFile}) => ({ value: fixtureFile, label: fixtureFile }))}
    />
  </>
}
