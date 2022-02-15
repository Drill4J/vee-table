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
import { Form, Formik } from 'formik';
import React, { useState } from 'react';
import VersionsSelect from '../versions-select';
import { Ledger, RawVersion } from '@drill4j/vee-ledger';
import { useClickOutside } from '../../hooks/use-click-outside';

export default function FilterByComponentsVersions({
  setupId,
  ledger,
  column: { setFilter },
}: {
  setupId: string;
  ledger: Ledger;
  column: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const components = ledger?.getSetupComponents(setupId) || [];
  const ref = useClickOutside(() => setIsOpen(false));

  return (
    <Formik
      initialValues={{ componentsVersions: {} }}
      onSubmit={values => {
        const versions: RawVersion[] = Object.entries(values.componentsVersions).map(([componentId, tag]) => ({ componentId, tag })) as any;
        setFilter(versions);
        setIsOpen(false);
      }}
    >
      <Form>
        <div className="fill-current link" onClick={() => setIsOpen(true)}>
          <FilterIcon />
        </div>
        {isOpen && (
          <div className="absolute bg-shade3 p-2" ref={ref}>
            <VersionsSelect
              componentIds={components.map(({ id }) => id)}
              ledger={ledger as Ledger}
              fieldNamePrefix={'componentsVersions'}
            />
            <button type="submit">Submit</button>
          </div>
        )}
      </Form>
    </Formik>
  );
}

const FilterIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 15" fill="none">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M9 7C9 6.71467 9.12189 6.44292 9.33498 6.25317L14.987 1.03006L14.9911 1H1.01131L1.01491 1.02388L6.66503 6.25319C6.87812 6.44294 7 6.71467 7 7L7 12.5625L9 13.9922V7ZM16 1C16 0.447715 15.5523 0 15 0H0.930237C0.416481 0 0 0.416481 0 0.930237C0 0.97668 0.00347815 1.02306 0.0104053 1.06898L0.0261002 1.17303C0.0609311 1.40395 0.175479 1.61539 0.34988 1.7707L6 7V12.5625C6 12.8414 6.11649 13.1076 6.32135 13.2969L8.32135 14.7266C8.9618 15.3184 10 14.8642 10 13.9922V7L15.652 1.77689C15.8307 1.61783 15.9464 1.40001 15.9782 1.16295L16 1Z"
        fill="#A4ACB3"
      />
    </svg>
  );
};
