import { isValidElement } from 'react';

import type { TGradientElement, TGradientType } from '../../interfaces';
import { descriptorOf } from '../descriptor/gradient-descriptor.util';

const LibraryTag = '[@rit3zh/gradients]';

class GradientError extends TypeError {
  constructor(message: string) {
    super(`${LibraryTag} ${message}`);
    this.name = 'GradientError';
  }
}

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new GradientError(message);
  }
}

function assertNonEmpty(value: string | undefined, label: string): asserts value is string {
  invariant(
    typeof value === 'string' && value.trim() !== '',
    `${label} must be a non-empty string`
  );
}

function assertFiniteNumber(value: unknown, label: string): asserts value is number {
  invariant(
    typeof value === 'number' && Number.isFinite(value),
    `${label} must be a finite number, received ${String(value)}`
  );
}

function assertNonNegative(value: unknown, label: string): asserts value is number {
  assertFiniteNumber(value, label);
  invariant(value >= 0, `${label} must be zero or greater, received ${value}`);
}

function assertGradientElement<T extends TGradientType = TGradientType>(
  element: unknown,
  label = 'gradient'
): asserts element is TGradientElement<T> {
  invariant(
    isValidElement(element) && descriptorOf(element) !== undefined,
    `${label} expects a gradient element such as <LinearGradient /> or <GradientStack>`
  );
}

export {
  GradientError,
  invariant,
  assertNonEmpty,
  assertFiniteNumber,
  assertNonNegative,
  assertGradientElement,
};
