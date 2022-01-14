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
import { Formik, Form, Field } from 'formik';
import SelectField from './generic/select-field';
import { LedgerData } from '@drill4j/vee-ledger';
import VersionsSelect from '../versions-select'
import { useEffect, useState } from 'react';
import { Ledger } from '@drill4j/vee-ledger';
import connection from '../../github/connection';

interface AutotestsSetup {
  file: string;
  cypressEnv: Record<string, string>;
  params: Record<string, string>[];
}

export default (props: { ledger: Ledger; data: LedgerData }) => {
  const {setups} = props.data;
  const [autotestsSetups, setAutotestsSetups] = useState<Record<string, AutotestsSetup>>({});
  const [componentIds, setComponentIds] = useState<string[]>([]);

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
        initialValues={{setupId: '', isCustomParams: {}, componentsVersions: {}, params: {}}}
        onSubmit={async ({ setupId, componentsVersions, params }) => {
          try {
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
          }catch (e) {
            alert('Action failed: ' + (e as any)?.message || JSON.stringify(e));
          }
        }}
      >
        {({ isSubmitting, values,  }) => (
          <Form>
            <label htmlFor="start-setup-setup-id">Component</label>
            <Field
              id="start-setup-setup-id"
              name={'setupId'}
              component={SelectField(async (setupId, form) => {
                const ids = setups.find(({id}) =>  setupId === id)?.componentIds || [];
                const latestVersion = props.ledger.getComponentsLatestVersions(ids);

                form.setFieldValue("componentsVersions",latestVersion.reduce((acc, {componentId, tag}) => ({...acc, [componentId]: tag}), {}))
                setComponentIds(ids)
              })}
              options={Object.entries(autotestsSetups).map(([id]) => ({ value: id, label: id }))}
            />
            { values.setupId && <FormSetParams values={values} autotestsSetups={autotestsSetups}/>}
            <label htmlFor="add-test-field-status">Component Versions</label>
            <VersionsSelect componentIds={componentIds} ledger={props.ledger} fieldNamePrefix={'componentsVersions'}/>
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
  const params = autotestsSetups[values.setupId].params.reduce((acc: Record<string, string[]>, params) => {
    Object.entries(params).forEach(([name, value]) => {
      if(acc[name]) {
        acc[name] = [...acc[name], value];
      }else {
        acc[name] = [value]
      }
    })
    return acc;
  }, {})

  return <>
    {Object.entries(params).map(([name, paramValues]) =>
      <div style={{display: 'flex', flexDirection: "column"}}>
        <div style={{display: 'flex', gap: "8px", alignItems: 'center'}}>
          <label htmlFor={`${name}-custom-params-checkbox`}>Custom {name} param</label>
          <Field
            id={`${name}-custom-params-checkbox`}
            name={`isCustomParams.${name}`}
            type={'checkbox'}
          />
        </div>
        <label htmlFor={`${name}-param`}>Param: {name}</label>
        {values.isCustomParams[name] ?
          <Field
            id={`${name}-param`}
            name={`params.${name}`}
            type={'text'}
          /> :
          <Field
            id={'start-setups-params'}
            name={`params.${name}`}
            component={SelectField()}
            options={paramValues.map((param) => ({ value: param, label: param }))}
          />}
      </div>)}
  </>
}