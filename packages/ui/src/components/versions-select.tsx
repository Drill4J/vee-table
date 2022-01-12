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
import Spinner from './spinner';
import Alert from './alert';
import { Field } from 'formik';
import SelectField from './forms/generic/select-field';
import { Ledger } from '@drill4j/vee-ledger';
import useVersions from '../github/hooks/use-versions'


export default function (props: { ledger: Ledger; componentIds: string[], fieldNamePrefix: string }) {
  const { isLoading: isLoadingVersionsData, vers, error } = useVersions(props.componentIds, props.ledger);

  if (!Array.isArray(props.componentIds) || props.componentIds.length === 0) return <Spinner>...select setup first</Spinner>;
  if (isLoadingVersionsData) return <Spinner>loading versions</Spinner>;
  if (error) return <Alert>{error}</Alert>;

  return (
    <table>
      <tbody>
        {props.componentIds.map(id  => (
          <tr key={id}>
            <td>
              <label style={{ cursor: 'pointer' }} htmlFor={`${props.fieldNamePrefix}-${id}`}>
                {id}
              </label>
            </td>
            <td>
              {!Array.isArray(vers[id]) ? (
                'no versions'
              ) : (
                <Field
                  id={`${props.fieldNamePrefix}-${id}`}
                  name={`${props.fieldNamePrefix}.${id}`}
                  component={SelectField()}
                  options={vers[id].map(versionTag => ({ value: versionTag, label: versionTag }))}
                />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
