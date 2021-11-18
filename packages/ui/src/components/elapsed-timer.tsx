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
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useState, useEffect } from 'react';
import { C } from './styles';

dayjs.extend(relativeTime);

export default function ElapsedTimer({ start = Date.now(), updateFrequency = 1000 * 10 }: ElapsedProps) {
  const elapsed = useElapsed({ start, updateFrequency });
  return <span style={{ color: C.yellow }}>{elapsed}</span>;
}

export function useElapsed({ start, updateFrequency }: ElapsedProps) {
  const s = dayjs(start);
  const [elapsedStr, setElapsedStr] = useState(s.fromNow());
  useEffect(() => {
    setInterval(() => {
      setElapsedStr(s.fromNow());
    }, updateFrequency);
  }, [updateFrequency]);
  // FIXME passing start is kinda hack-ish, but I'm unsure about passing "s" as it's the instance of dayjs

  return elapsedStr;
}

export type ElapsedProps = { start?: number; updateFrequency?: number };
