export const RGB = {
  Red: new Uint8ClampedArray([255, 0, 0, 255]),
  Green: new Uint8ClampedArray([0, 255, 0, 255]),
  Blue: new Uint8ClampedArray([0, 0, 255, 255]),
};

export function isSetterCallback<Type>(
  value: any,
): value is (value: Type) => Type {
  return typeof value === "function";
}

export function isSetterValue<Type>(value: any): value is Type {
  return !isSetterCallback(value);
}

export function assertDefined<Type>(
  message: string,
  value: Type | undefined | null,
): Type {
  if (value === undefined || value === null)
    throw new Error(`${message} is undefined`);
  return value;
}

export function logDefined<Type>(message: string, value: Type): Type {
  try {
    assertDefined(message, value);
  } catch (e) {
    console.error(e);
  }
  return value;
}
