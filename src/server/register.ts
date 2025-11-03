/**
 * Chronos v2.0 - Path Alias Register
 * 
 * 注册路径别名以支持 tsx
 */

import { register } from 'node:module'
import { pathToFileURL } from 'node:url'

register('ts-node/esm', pathToFileURL('./'))
