/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, {createContext, useContext} from 'react';

console.log('CREATING CONTEXT');

export const LocationContext = createContext();
export function useLocation() {
  return useContext(LocationContext);
}
