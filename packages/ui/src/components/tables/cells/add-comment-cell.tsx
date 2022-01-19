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
import { useState } from 'react';
import { Field, Form, Formik } from 'formik';
import { Ledger, Comment } from '@drill4j/vee-ledger';

interface Props {
  releaseComponentDate: number;
  user: any;
  ledger: Ledger;
  comment?: Comment
}

export default function({releaseComponentDate, user, ledger, comment}: Props) {
  const {message: previousMessage = ''} = comment || {};
  const [isOpen, setIsOpen] = useState(false);

  return(
    <div className="relative">
      <button onClick={() => setIsOpen(true)}>Add comment</button>
      {isOpen && (
        <Formik initialValues={{message: previousMessage}} onSubmit={async ({message}) => {
          try {
            await ledger.addComment({ releaseComponentDate, message, userName: user?.name })
            window.location.reload();
          } catch (e) {
            alert('Action failed: ' + (e as any)?.message || JSON.stringify(e));
          }
        }}>
          <FormAddComponent onClose={() => setIsOpen(false)}/>
        </Formik>
      )}
    </div>
  )
}

function FormAddComponent({onClose}: {onClose: () => void}) {
  return(
    <div className="absolute z-10 bg-shade3">
      <Form className="flex flex-col min-w-[250px]">
        <Field
          id={`message`}
          name={`message`}
          as={'textarea'}
          autoFocus
        />
        <button type='submit'>Submit</button>
        <button type='button' onClick={onClose}>Close</button>
      </Form>
    </div>
  )
}
