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
import { Comment } from '@drill4j/vee-ledger';
import NoRender from '../../no-render';
import { useState } from 'react';
import { Field, Form, Formik } from 'formik';
import { Ledger } from '@drill4j/vee-ledger/build';
import { useClickOutside } from '../../../hooks/use-click-outside';

interface Props {
  releaseComponentDate: number;
  user: any;
  ledger: Ledger;
  comment?: Comment
}

export default function CommentCell(props: Props) {
  const { comment } = props

  return (
    <div>
      {comment?.userName && comment?.message &&
        <NoRender label={comment?.userName}>
          <div className='max-w-[250px] whitespace-pre-wrap'>{comment?.message}</div>
        </NoRender>
      }
      <AddComment {...props}/>
    </div>
  );
}


const AddComment = ({releaseComponentDate, user, ledger, comment}: Props) => {
  const {message: previousMessage = ''} = comment || {};
  const [isOpen, setIsOpen] = useState(false);
  const ref = useClickOutside(() => setIsOpen(false))

  return(
    <div className="relative">
      <div className="fill-current link" onClick={() => setIsOpen(true)} title={comment?.message ? 'Edit' : 'Add'}>
        <AddCommentSvg />
      </div>
      {isOpen && (
        <Formik initialValues={{message: previousMessage}} onSubmit={async ({message}) => {
          try {
            await ledger.addComment({ releaseComponentDate, message, userName: user?.name })
            window.location.reload();
          } catch (e) {
            alert('Action failed: ' + (e as any)?.message || JSON.stringify(e));
          }
        }}>
          <div className="absolute z-10 bg-shade3 -left-[250px]" ref={ref}>
            <Form className="flex flex-col w-[250px]">
              <Field
                id={`message`}
                name={`message`}
                as={'textarea'}
                autoFocus
              />
              <button type='submit'>Submit</button>
            </Form>
          </div>
        </Formik>
      )}
    </div>
  )
}

const AddCommentSvg = () => <svg
  xmlns='http://www.w3.org/2000/svg'
  version='1.1'
  x='0'
  y='0'
  width='24'
  height='24'
  viewBox='-247 370.9 100 100'>
  <path
    d='M-147.7 390.4c-.3-5.5-4.7-9.8-10-9.8h-78.8c-5.6 0-10.1 4.6-10.1 10.2v42.3c0 5.5 4.6 10.2 10.1 10.2h2.3v14.1c0 1.5.8 2.8 2.2 3.4.6.3 1.1.4 1.7.4 1 0 1.9-.4 2.6-1.1l17.3-16.9h52.8c5.4 0 10-4.7 10-10.2v-42.6h-.1zm-5 42.7c0 2.8-2.3 5.2-5 5.2h-54.8l-16.7 16.3v-16.3h-7.3c-2.7 0-5.1-2.4-5.1-5.2v-42.3c0-2.8 2.3-5.2 5.1-5.2h78.8c2.7 0 4.8 2.2 5 5v42.5z' />
</svg>;
