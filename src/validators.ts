import { flow, pick } from 'lodash/fp'

import { all, not, makeValidator } from './utils'

export type ValidatorMessage = string | symbol

export type ValidatorResult = {
  isValid: boolean
  messages: ValidatorMessage[]
}

export type AsyncValidator<T> = (v: T) => Promise<ValidatorResult>
export type SyncValidator<T> = (v: T) => ValidatorResult
export type Validator<T> = (v: T) => ValidatorResult | Promise<ValidatorResult>

type ArrayLike = string | any[]

export const equals = <T>(
  target: T,
  message?: ValidatorMessage
): SyncValidator<T> => makeValidator((v) => v === target, message)

export const instanceOf = <T>(
  proto: new () => T,
  message?: ValidatorMessage
): SyncValidator<any> => makeValidator((v) => v instanceof proto, message)

export const isLength = (
  l: number,
  message?: ValidatorMessage
): SyncValidator<ArrayLike> => makeValidator((v) => v.length === l, message)

export const isEmpty = (
  message?: ValidatorMessage
): SyncValidator<ArrayLike | null | void> => isLength(0, message)

export const isType = (
  t: string,
  message?: ValidatorMessage
): SyncValidator<any> => makeValidator((v: any) => typeof v === t, message)

export const isDate = (message?: ValidatorMessage): SyncValidator<any> =>
  all([instanceOf(Date), (v: Date) => isNumber()(v.getTime())], message)

export const isNull = (message?: ValidatorMessage): SyncValidator<any> =>
  equals(null, message)

export const isNumber = (message?: ValidatorMessage): SyncValidator<any> =>
  all([isType('number'), not(makeValidator(isNaN))], message)

export const isInteger = (message?: ValidatorMessage): SyncValidator<number> =>
  all([isNumber(), makeValidator((v: number) => v === Math.floor(v))], message)

export const isUndefined = (message?: ValidatorMessage): SyncValidator<any> =>
  not(isType('undefined'), message)

export const divisibleBy = (
  n: number,
  message?: ValidatorMessage
): SyncValidator<number> =>
  all([isNumber(), makeValidator((v: number) => v % n === 0)], message)

export const max = (
  maxV: number,
  message?: ValidatorMessage
): SyncValidator<number> =>
  all([isNumber(), makeValidator((v: number) => v <= maxV)], message)

export const min = (
  minV: number,
  message?: ValidatorMessage
): SyncValidator<number> =>
  all([isNumber(), makeValidator((v: number) => v >= minV)], message)

const getLength = pick('length')
export const maxLength = (
  maxL: number,
  message?: ValidatorMessage
): SyncValidator<ArrayLike> =>
  flow(
    getLength,
    max(maxL, message)
  )
export const minLength = (
  minL: number,
  message?: ValidatorMessage
): SyncValidator<ArrayLike> =>
  flow(
    getLength,
    min(minL, message)
  )

export const pattern = (
  p: RegExp,
  message?: ValidatorMessage
): SyncValidator<string> =>
  all([isType('string'), makeValidator((v: string) => p.test(v))], message)

// very naiive. text parsing should not be relied on for validating emails as there
// are just too many valid possibilities. just send users an email with a confirmation link.
export const email = (message?: ValidatorMessage): SyncValidator<string> =>
  pattern(/.+@.+\..+/, message)

export const required = (message: ValidatorMessage): Validator<any> =>
  all([not(isEmpty()), not(isNull()), not(isUndefined())], message)
