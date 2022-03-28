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
import { useClickOutside } from '../../../hooks/use-click-outside';
import { Field, Form, Formik } from 'formik';
import { Ledger, Comment } from '@drill4j/vee-ledger';

interface Props {
  releaseComponentDate: number;
  user: any;
  ledger: Ledger;
  comment?: Comment;
}

export default function AddCommentCell({ releaseComponentDate, user, ledger, comment }: Props) {
  const { message: previousMessage = '' } = comment || {};
  const [isOpen, setIsOpen] = useState(false);
  const ref = useClickOutside(() => setIsOpen(false));

  return (
    <div className="relative">
      <div className="fill-current link" onClick={() => setIsOpen(true)} title={comment?.message ? 'Edit' : 'Add'}>
        <AddCommentSvg />
      </div>
      {isOpen && (
        <Formik
          initialValues={{ message: previousMessage }}
          onSubmit={async ({ message }) => {
            try {
              await ledger.addComment({ releaseComponentDate, message, userName: user?.login });
              window.location.reload();
            } catch (e) {
              alert('Action failed: ' + (e as any)?.message || JSON.stringify(e));
            }
          }}
        >
          <div className="absolute z-10 bg-shade3 -left-[250px]" ref={ref}>
            <Form className="flex flex-col w-[250px]">
              <Field id={`message`} name={`message`} as={'textarea'} autoFocus />
              <button type="submit">Submit</button>
            </Form>
          </div>
        </Formik>
      )}
    </div>
  );
}

const AddCommentSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
