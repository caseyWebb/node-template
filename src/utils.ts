import {
  SyncValidator,
  ValidatorMessage,
  AsyncValidator,
  Validator,
  ValidatorResult
} from './validators'

export function all<T>(
  validators: SyncValidator<T>[],
  message?: ValidatorMessage
): SyncValidator<T>
export function all<T>(
  validators: Validator<T>[],
  message?: ValidatorMessage
): AsyncValidator<T>
export function all<T>(validators: Validator<T>[], message?: ValidatorMessage) {
  return (v: T) => {
    function _all(results: ValidatorResult[]): ValidatorResult {
      const isValid = results.every((res) => res.isValid)
      const messages = results.flatMap((res) => res.messages)
      if (message) messages.push(message)
      return { isValid, messages }
    }
    const results = validators.map((validate) => validate(v))
    return results.some(isThenable)
      ? Promise.all(results).then(_all)
      : _all(results as ValidatorResult[])
  }
}

export function not<T>(
  validator: SyncValidator<T>,
  message?: ValidatorMessage
): SyncValidator<T>
export function not<T>(
  validator: Validator<T>,
  message?: ValidatorMessage
): AsyncValidator<T>
export function not<T>(
  validator: Validator<T>,
  message?: ValidatorMessage
): Validator<T> {
  function _not(result: ValidatorResult): ValidatorResult {
    const isValid = !result.isValid
    return {
      isValid,
      messages: isValid || !message ? [] : [message]
    }
  }
  return (v: T) => {
    const results = validator(v)
    return isThenable(results)
      ? (results as Promise<ValidatorResult>).then(_not)
      : _not(results as ValidatorResult)
  }
}

export function onlyIf<T>(
  condition: SyncValidator<T>,
  validator: SyncValidator<T>
): SyncValidator<T>
export function onlyIf<T>(
  condition: Validator<T>,
  validator: Validator<T>
): AsyncValidator<T>
export function onlyIf<T>(
  condition: Validator<T>,
  validator: Validator<T>
): Validator<T> {
  return (v: T) => {
    function _onlyIf(
      shouldValidate: ValidatorResult
    ): ValidatorResult | Promise<ValidatorResult> {
      return shouldValidate.isValid
        ? validator(v)
        : {
            isValid: true,
            messages: []
          }
    }
    const conditionResult = condition(v)
    return isThenable(conditionResult)
      ? (conditionResult as Promise<ValidatorResult>).then(_onlyIf)
      : _onlyIf(conditionResult as ValidatorResult)
  }
}

export function makeValidator<T>(
  validate: (v: T) => boolean,
  message?: ValidatorMessage
): SyncValidator<T>
export function makeValidator<T>(
  validate: (v: T) => Promise<boolean>,
  message?: ValidatorMessage
): AsyncValidator<T>
export function makeValidator<T>(
  validate: (v: T) => boolean | Promise<boolean>,
  message?: ValidatorMessage
): Validator<T> {
  return (v: T) => {
    function _makeValidator(isValid: boolean): ValidatorResult {
      return {
        isValid,
        messages: isValid || !message ? [] : [message]
      }
    }
    const result = validate(v)
    return isThenable(result)
      ? (result as Promise<boolean>).then(_makeValidator)
      : _makeValidator(result as boolean)
  }
}

function isThenable(x: any): boolean {
  return typeof x.then === 'function'
}
